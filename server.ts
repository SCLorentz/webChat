import { Application, Router, send, Cookies } from "https://deno.land/x/oak@v12.6.1/mod.ts"; //Servidor
import { Session } from "https://deno.land/x/oak_sessions@v4.0.5/mod.ts";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts"; //database

import * as fs from "node:fs"; //files info

const oauth2Client = new OAuth2Client({
    clientId: "38057856247-sh5mjb39qop277fcgisa9c2sq2nioofd.apps.googleusercontent.com",
    clientSecret: "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",
    authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUri: "https://oauth2.googleapis.com/token",
    redirectUri: "http://localhost:8080/oauth2/callback",
    defaults: {
        scope: ["email", "profile", "https://www.googleapis.com/auth/contacts"],
    },
}), db = new DB("./database/data.db");

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

const router = new Router<AppState>();
router
    .get("/", async (ctx) => {
        // information about the collected data
        if (ctx.request.url.toString().includes("?data")) {
            ctx.response.body = await Deno.readFile("./view/interface/collected_data.html");
            return
        }
        // is user logged in?
        // the cookies autnetication is not secure, but it works, review later
        const tokens = ctx.state.session.get("tokens") as | { accessToken: string } | undefined || ctx.request.headers.get("login") as unknown as | { accessToken: string } | undefined;
        //
        let html = new TextDecoder().decode(await Deno.readFile("./public/index.html"));
        //
        // this dosen't verfy if the tokens are valid
        if (!tokens) {
            // Construir a URL para o redirecionamento de autorização e obter um codeVerifier para o login
            const { uri, codeVerifier } = await oauth2Client.code.getAuthorizationUri();
            ctx.state.session.flash("codeVerifier", codeVerifier);
            console.log("codeVerifier: ", codeVerifier);
            console.log("flash: ", ctx.state.session.get("codeVerifier"));
            //
            
            const cookies = new Cookies(ctx.request.headers, { secure: true }); // Marcado como seguro (opcional)
            cookies.set("login", codeVerifier, { maxAge: 600000 }); // Expira em 1 hora

            // Adicione o cookie à resposta
            ctx.response.headers.set("Set-Cookie", cookies.toString());
            //
            html = new TextDecoder().decode(await Deno.readFile("./view/interface/login.html"))
                // replace the google and microsoft buttons with the links
                .replace(/<google\/>/g, /*html*/`<a href="${uri}"><img src="/img/google.svg" height="50"></a>`)
                .replace(/<microsoft\/>/g, /*html*/`<a href="#microsoft" style="border-radius:0"><img src="/img/microsoft.svg" height="50" style="border-radius:0"></a>`)
                .replace("<head>", /*html*/`<head>\n<link rel="prefetch" href="${uri}">`);
        }
        //descobrir forma de enviar para o cliente
        const userResponse = tokens ? await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken}`,
                },
            },
        ): null;
        //
        const userData = userResponse ? await userResponse.json() : null;
        //
        const usr_data_cookies = new Cookies(ctx.request.headers, { secure: true }); // Marcado como seguro (opcional)
        usr_data_cookies.set("userData", userData, { maxAge: 600000 }); // Expira em 1 hora
        /*const contactsResponse = await fetch(
          "https://people.googleapis.com/v1/people/me/connections?personFields=emailAddresses",
          {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          },
        );
        const contactsData = await contactsResponse.json();<--lidar com essa informação na database no server-side*/
        //
        ctx.response.headers.set("Content-Type", "text/html");
        ctx.response.body = html;
    })
    // login
    .get("/oauth2/callback", async (ctx) => {
        console.log("login");
        // Verificar se o codeVerifier está presente na sessão do usuário
        const codeVerifier = ctx.state.session.get("codeVerifier");
        if (typeof codeVerifier !== "string") {
        ctx.response.headers.set("Content-Type", "text/html");
        ctx.response.body = await Deno.readFile("./view/err/500.html");
        return Error("Código de verificação inválido");
        //throw new Error("Código de verificação inválido");
        }

        // Trocar o código de autorização por um token de acesso
        const tokens = await oauth2Client.code.getToken(ctx.request.url, { codeVerifier });
        ctx.state.session.flash("tokens", tokens);
        // git, cade meu commit?
        ctx.response.redirect("/");
    })
    // enviar dados (back-end --> front-end)
    .post("/enviar", async (ctx) => {
        const body = ctx.request.body();
        // is json? The response should be json
        if (body.type != "json") {
            ctx.response.status = 400;
            ctx.response.body = { message: "Ooops... parece que algo deu errado. Sua resposta deveria estar no formato JSON!" };
            return
        }
        // the type of the body is json
        const data = await body.value /*?? {message: "Erro ao inserir dados no banco de dados"}*/;
        // check the db for the data
        try {
            DBData(data);
            ctx.response.body = { message: "Dados recebidos com sucesso! :)" };
        } catch (error) {
            console.error("Erro ao executar a consulta SQL: ", error);
            ctx.response.body = { message: "Erro ao inserir dados no banco de dados" };
        }
    })
    // receber dados
    .get("/receber", (ctx) => ctx.response.body = { chats: db.query("SELECT name, id, img FROM chats") })
    // file server (pages)
    .get("/:item", async (ctx) => {
        //
        const extensionMatch = ctx.params.item.match(/\.(\w+)$/),
              extension = extensionMatch ? extensionMatch[1] : null;
        //
        let path = "./public/pages/" + ctx.params.item.replace(/\.(\w+)$/,"") + ".html";
        // if the file extension is not html or the html file dosen't exist
        // preference: use the file with the same name in the public/pages folder if the extension is not html
        // html files are the ones with the most priority
        if (extension !== 'html' && extension !== null || !fs.existsSync(path)) {
            // handle with other files
            for (const file of fs.readdirSync('./public/pages')) {
                if (!file.includes(ctx.params.item)) { continue }
                //
                path = "./public/pages/" + file;
                break;
            }
        }
        // review try catch, it can be improved
        try {
            await send(ctx, path);
        } catch (error) {
            ctx.response.status = error.status;
            if (!fs.existsSync(`./view/err/${error.status}.html`)) {
                ctx.response.body = /*html*/`<html><head><title>${error.status}</title></head><body><h1>${error.status}</h1></body></html>`;
                return
            }
            await send(ctx, `./view/err/${error.status}.html`);
        }
    })
    // files server (folders and general files)
    .get("/:folder/(.+)", async (ctx) => {
        //console.log(ctx.params[0]);
        try {
            await send(ctx, `./public/${ctx.params.folder}/${ctx.params[0]}`);
        } catch (error) {
            ctx.response.status = error.status;
        }
    });

const app = new Application<AppState>();

app
    .use(Session.initMiddleware())
    .use(router.allowedMethods(), router.routes());

console.log(`HTTP server running. Access it at: http://localhost:5959/`);
await app.listen({ port: 5959 });