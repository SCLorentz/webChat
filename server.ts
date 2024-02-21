import { Application, Context, send, Router } from 'https://deno.land/x/oak/mod.ts'; //Servidor
import { bold, cyan, green, yellow } from "https://deno.land/std@0.200.0/fmt/colors.ts"; //console
import { DB } from "https://deno.land/x/sqlite/mod.ts"; //database
//import { compile } from "https://x.nest.land/sass@0.2.0/mod.ts"; //style scss <-- modulo bugado
//import { indexedDB } from "https://deno.land/x/indexeddb@v1.1.0/ponyfill.ts";
//import { compare, hash } from "https://deno.land/x/bcrypt/mod.ts"; //criptografia
//import * as dejs from "https://deno.land/x/dejs@0.10.3/mod.ts"; //ejs

//import router from "./routes.ts";
import { errorHandler } from "./routes/errorHandler.ts";

const port = 8080;
const app = new Application({ keys: ["data"] });
const db = new DB('./database/data.db');
//const ejs = require('ejs');

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

//BLOB --> dados binarios para armazenamento de arquivos

function DBData(data) {
  switch (data.type) {
    case "CREATE":
      db.query(`INSERT INTO ${data.target} (name, creation) VALUES (?, ?)`, [data.name, data.date]);
      break
    case "DELETE":
      db.execute(`DELETE FROM ${data.target} WHERE id = ${data.id};`);
      break
    case "EDIT":
      db.execute(`UPDATE ${data.target} SET name = ? WHERE id = ?`, [data.name, data.id]); //corrigir bugs e adicionar mais configurações
      break
  }
}
//corrigir bugs
function sendData(c) {
  return async function () {
    const body = await c.request.body();
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

const router = new Router();
router
  .get("/", async (ctx, next) => await send(ctx, "./public/index.html"))
  .get("/enviar", async (ctx, next) => await sendData(ctx)() /*corrigir bugs*/)
  .get("/receber", (ctx, next) => ctx.response.body = { chats: db.query("SELECT name, id FROM chats") })
  .get("/:item", async (ctx, next) => {
    try {
      const filePath = `./public/pages/${ctx.params.item}.html`.replace(/\\/g, "/");
      await send(ctx, filePath);
    } catch (error) {
      ctx.response.body = `<html><head><title>${error.status}</title></head><body><h1>${error.status}</h1></body></html>`;
      ctx.response.status = error.status;
    }
  })
  .get("/:folder/:item", async (ctx, next) => {
    if (ctx.request.headers.get("Referer")?.includes("http://")) {
      try {
        await send(ctx, `./public/${ctx.params.folder}/${ctx.params.item}`);
      } catch (error) {
        ctx.response.status = error.status;
      }
    } else {
      ctx.response.status = 403;
      const fileContent = await Deno.readTextFile("./view/error/403.html");
      ctx.response.body = fileContent;
    }
  })

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(errorHandler);

console.log('HTTP server running. Access it at: ' + yellow(`http://localhost:${port}/`));

await app.listen({
  port: port,
  secure: true,
  //keyFile: "./examples/tls/localhost.key",
  //certFile: "./examples/tls/localhost.crt"
});

//deno run -A server.ts

//db.close();