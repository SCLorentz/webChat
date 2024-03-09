import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions@v4.0.5/mod.ts";
import { OAuth2Client } from "https://deno.land/x/oauth2_client/mod.ts";

const oauth2Client = new OAuth2Client({
    clientId: "38057856247-sh5mjb39qop277fcgisa9c2sq2nioofd.apps.googleusercontent.com", // Substitua pelo ID do cliente do Google
    clientSecret: "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", // Substitua pelo segredo do cliente do Google
    authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth", // Endpoint de autorização do Google
    tokenUri: "https://oauth2.googleapis.com/token", // Endpoint de token do Google
    redirectUri: "http://localhost:8000/oauth2/callback", // URL de redirecionamento do seu aplicativo
    defaults: {
        scope: ["email", "profile", "https://www.googleapis.com/auth/contacts"], // Escopos necessários para o login com o Google
    },
});

type AppState = {
    session: Session;
};

const router = new Router<AppState>();
router.get("/", ctx => {
    //verificar se o usuario está autenticado
    ctx.response.redirect("/login")
})
router.get("/login", async (ctx) => {
    // Construir a URL para o redirecionamento de autorização e obter um codeVerifier
    const { uri, codeVerifier } = await oauth2Client.code.getAuthorizationUri();

    // Armazenar o codeVerifier na sessão do usuário
    ctx.state.session.flash("codeVerifier", codeVerifier);

    // Redirecionar o usuário para o endpoint de autorização
    ctx.response.redirect(uri);
});
router.get("/oauth2/callback", async (ctx) => {
    // Verificar se o codeVerifier está presente na sessão do usuário
    const codeVerifier = ctx.state.session.get("codeVerifier");
    if (typeof codeVerifier !== "string") {
        throw new Error("Código de verificação inválido");
    }

    // Trocar o código de autorização por um token de acesso
    const tokens = await oauth2Client.code.getToken(ctx.request.url, {
        codeVerifier,
    });

    // Usar o token de acesso para fazer uma solicitação de API autenticada
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
        },
    });
    const userData = await userResponse.json();
    // Usar o token de acesso para fazer uma solicitação de API autenticada
    const contactsResponse = await fetch("https://www.googleapis.com/m8/feeds/contacts/default/full", {
        headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
        },
    });
    const contactsData = await contactsResponse;
    //
    console.log(contactsData);
    console.log(userData)
    ctx.response.body = `
        <html>
            <head>
                <title>${userData.name}</title>
            </head>
            <body>
                <img src="${userData.picture}">
                <script>
                    localStorage.setItem('user', ${userData});
                </script>
            </body>
        </html>
    `;
});

const app = new Application<AppState>();
app.use(Session.initMiddleware());
app.use(router.allowedMethods(), router.routes());


console.log(`HTTP server running. Access it at: http://localhost:8000/`);
await app.listen({ port: 8000 });