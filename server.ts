import { Application, Context, Router, send } from "https://deno.land/x/oak@v12.6.1/mod.ts"; //Servidor
import { Session } from "https://deno.land/x/oak_sessions@v4.0.5/mod.ts";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts"; //database
// deno-lint-ignore no-unused-vars
import { CustomHtml } from "./custom/CHTML.ts";

/*const obj = new CustomHtml(
    "<div id='user'></div>",
    "./public/index.html",
    "userData"
);
obj.build().then(() => console.log(obj.value));*/

const oauth2Client = new OAuth2Client({
    clientId: "38057856247-sh5mjb39qop277fcgisa9c2sq2nioofd.apps.googleusercontent.com",
    clientSecret: "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",
    authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUri: "https://oauth2.googleapis.com/token",
    redirectUri: "http://localhost:8080/oauth2/callback",
    defaults: {
        scope: ["email", "profile", "https://www.googleapis.com/auth/contacts"],
    },
});
const db = new DB("./database/data.db");

interface CustomContext extends Context {
    error: (message: string, error: Error) => void;
}

type AppState = {
    session: Session;
    informacaoExtra: string;
};

function DBData(data: Record<string, string>) {
    switch (data.type) {
        case "CREATE":
            db.query(`INSERT INTO ${data.target} (name, creation) VALUES (?, ?)`, [
                data.value,
                data.date,
            ]);
            break;
        case "DELETE":
            db.execute(`DELETE FROM ${data.target} WHERE id = ${data.id};`);
            break;
        case "EDIT":
            db.query(`UPDATE ${data.target} SET ${data.column} = ? WHERE id = ?`, [
                data.value,
                data.id,
            ]); //corrigir bugs e adicionar mais configurações
            break;
    }
}
//corrigir bugs
function sendData(c: CustomContext) {
    return async function () {
        const body = c.request.body();
        // is json? The response should be json
        if (body.type != "json") {
            c.response.status = 400;
            c.response.body = { message: "Ooops, parece que algo deu errado. Sua resposta deveria estar no formato JSON!" };
            return
        }
        const data = await body.value;
        // check the db
        try {
            DBData(data);
            c.response.body = { message: "Dados recebidos com sucesso! :)" };
        } catch (error) {
            c.error("Erro ao executar a consulta SQL: ", error);
            c.response.body = {
                message: "Erro ao inserir dados no banco de dados",
            };
        }
    };
}

const router = new Router<AppState>();
router
    .get("/", async (ctx) => {
        // is user logged in?
        const tokens = ctx.state.session.get("tokens") as | { accessToken: string } | undefined;
        //
        if (!tokens) {
            // Construir a URL para o redirecionamento de autorização e obter um codeVerifier
            const { uri, codeVerifier } = await oauth2Client.code.getAuthorizationUri();
            ctx.state.session.flash("codeVerifier", codeVerifier);
            //usar classe em "./custom/CHTML.ts"
            const file = await Deno.readFile("./view/interface/login.html");
            //
            let html = new TextDecoder().decode(file);
            // replace custom html
            html = html
                .replace(/<google\/>/g, `<a href="${uri}"><img src="/img/google.svg" height="50"></a>`)
                .replace(/<microsoft\/>/g, `<a href="#microsoft" style="border-radius:0"><img src="/img/microsoft.svg" height="50" style="border-radius:0"></a>`)
                .replace("<head>", `<head>\n<link rel="prefetch" href="${uri}">`)
            //
            ctx.response.headers.set("Content-Type", "text/html");
            ctx.response.body = html;
            return
        }
        //descobrir forma de enviar para o cliente
        const userResponse = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken}`,
                },
            },
        );
        const userData = await userResponse.json();
        /*const contactsResponse = await fetch(
          "https://people.googleapis.com/v1/people/me/connections?personFields=emailAddresses",
          {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          },
        );
        const contactsData = await contactsResponse.json();<--lidar com essa informação na database no server-side*/
        // send --> usar classe em "./custom/CHTML.ts"
        //
        let html = new TextDecoder().decode(await Deno.readFile("./public/index.html"));
        // replace custom html
        html = html.replace("<userData/>", `<script>const userData = ${JSON.stringify(userData)}</script>`);
        //
        ctx.response.headers.set("Content-Type", "text/html");
        ctx.response.body = html;
    })
    // login
    .get("/oauth2/callback", async (ctx) => {
        // Verificar se o codeVerifier está presente na sessão do usuário
        const codeVerifier = ctx.state.session.get("codeVerifier");
        if (typeof codeVerifier !== "string") {
            throw new Error("Código de verificação inválido");
        }

        // Trocar o código de autorização por um token de acesso
        const tokens = await oauth2Client.code.getToken(ctx.request.url, {
            codeVerifier,
        });
        ctx.state.session.flash("tokens", tokens);

        ctx.response.redirect("/");
    })
    // enviar dados (back-end --> front-end)
    .post("/enviar", async (ctx) => await sendData(ctx)())
    // receber dados
    .get("/receber", (ctx) => ctx.response.body = {
            chats: db.query("SELECT name, id, img FROM chats"),
    })
    .get("/:item", async (ctx) => {
        // review
        try {
            await send(ctx, `./public/pages/${ctx.params.item}.html`.replace(/\\/g,"/",));
        } catch (error) {
            // reavaliar funcionamento desse trecho, parece confuso e ineficiente
            try {
                await send(ctx, `./view/err/${error.status}.html`);
            } catch (error) {
                ctx.response.body =
                    `<html><head><title>${error.status}</title></head><body><h1>${error.status}</h1></body></html>`;
            }
            ctx.response.status = error.status;
        }
    })
    // err 403 not working properly
    .get("/:folder/:item", async (ctx) => {
        // the user is acessing the file directly by the url?
        if (!ctx.request.headers.get("Referer")?.includes("http://")) {
            // handle the request
            ctx.response.status = 403;
            await send(ctx, `./view/err/403.html`);
            //
            return
        }
        // no, send file
        try {
            await send(ctx, `./public/${ctx.params.folder}/${ctx.params.item}`);
        } catch (error) {
            ctx.response.status = error.status;
        }
    });

const app = new Application<AppState>();

app
    .use(Session.initMiddleware())
    .use(router.allowedMethods(), router.routes());

console.log(`HTTP server running. Access it at: http://localhost:8080/`);
await app.listen({ port: 8080 });