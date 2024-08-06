import { Application, Context, send, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts"; //Servidor
import { yellow } from "https://deno.land/std@0.200.0/fmt/colors.ts"; //console
import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts"; //database
import { Session } from "https://deno.land/x/oak_sessions@v4.0.5/mod.ts";

//import router from "./routes.ts";
//import { errorHandler } from "./routes/errorHandler.ts";

const port = 8080,
app = new Application({ keys: ["data"] }),
db = new DB('./database/data.db');

interface CustomContext extends Context {
  error: (message: string, error: Error) => void;
}

//chats
db.execute(`
  CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    guests_id INTEGER,
    creation DATETIME,
    description TEXT,
    adms_id INTEGER,
    creator TEXT,
    img BLOB
  )
`);
//Msgs
db.execute(`
  CREATE TABLE IF NOT EXISTS msgs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    group_id INTEGER,
    content Text,
    creation DATETIME,
    file BLOB
  )
`);
//Users
db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    joined DATETIME,
    img BLOB
  )
`);

db.execute(`
  CREATE TABLE IF NOT EXISTS themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created DATETIME,
    author_id INTEGER,
    img BLOB
  )
`);

db.execute(`
  CREATE TABLE IF NOT EXISTS plugins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created DATETIME,
    author_id INTEGER,
    img BLOB
  )
`);
db.query(`
  CREATE TABLE IF NOT EXISTS bw (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT
  )
`);

// Execute the SQL command to insert the value "batata" into the "word" column
/*db.query(`
  INSERT INTO bw (word) VALUES ('batata')
`);*/

function DBData(data: Record<string, string>) {
  switch (data.type) {
    case "CREATE":
      db.query(`INSERT INTO ${data.target} (name, creation) VALUES (?, ?)`, [data.value, data.date]);
      break
    case "DELETE":
      db.execute(`DELETE FROM ${data.target} WHERE id = ${data.id};`);
      break
    case "EDIT":
      db.query(`UPDATE ${data.target} SET ${data.column} = ? WHERE id = ?`,[data.value,data.id]); //corrigir bugs e adicionar mais configurações
      break
  }
}
//corrigir bugs
function sendData(c: CustomContext) {
  return async function () {
    const body = c.request.body();
    if (body.type === "json") {
      const data = await body.value;
      try {
        DBData(data);
        c.response.body = { message: "Dados recebidos com sucesso! :)" };
      } catch (error) {
        c.error('Erro ao executar a consulta SQL:', error);
        c.response.body = { message: "Erro ao inserir dados no banco de dados" };
      }
    } else {
      c.response.status = 400;
      c.response.body = { message: "ooops, parece que algo deu errado! :(" };
    }
  }
}

type AppState = {
  session: Session;
};

const router = new Router<AppState>();
router
  .get("/", async ctx => await send(ctx, "./public/index.html"))
  .post("/enviar", async ctx => await sendData(ctx)())
  .get("/receber", ctx => ctx.response.body = { chats: db.query("SELECT name, id, img FROM chats") })
  .get("/:item", async ctx => {
    try {
      const filePath = `./public/pages/${ctx.params.item}.html`.replace(/\\/g, "/");
      await send(ctx, filePath);
    } catch (error) {
      try {
        const fileContent = await Deno.readTextFile(`./view/err/${error.status}.html`);
        ctx.response.body = fileContent;
      } catch (error) {
        ctx.response.body = `<html><head><title>${error.status}</title></head><body><h1>${error.status}</h1></body></html>`;
      }
      ctx.response.status = error.status;
    }
  })
  .get("/:folder/:item", async ctx => {
    if (ctx.request.headers.get("Referer")?.includes("http://")) {
      try {
        await send(ctx, `./public/${ctx.params.folder}/${ctx.params.item}`);
      } catch (error) {
        ctx.response.status = error.status;
      }
    } else {
      ctx.response.status = 403;
      const fileContent = await Deno.readTextFile("./view/err/403.html");
      ctx.response.body = fileContent;
    }
  })

app
  .use(router.routes())
  .use(router.allowedMethods())
  //.use(errorHandler); --> corrigir os erros de type

console.log('HTTP server running. Access it at: ' + yellow(`http://localhost:${port}/`));

await app.listen({
  port: port,
  secure: true,
  //keyFile: "./examples/tls/localhost.key",
  //certFile: "./examples/tls/localhost.crt"
});

//deno run -A server.ts

//db.close();