import { Application, Context, send, Router } from 'https://deno.land/x/oak/mod.ts'; //Servidor
import { extname, join } from "https://deno.land/std/path/mod.ts";
import { bold, cyan, green, yellow } from "https://deno.land/std@0.200.0/fmt/colors.ts"; //console
import { DB } from "https://deno.land/x/sqlite/mod.ts"; //database
//import { compile } from "https://x.nest.land/sass@0.2.0/mod.ts"; //style scss <-- modulo bugado
//import { indexedDB } from "https://deno.land/x/indexeddb@v1.1.0/ponyfill.ts";
//import { compare, hash } from "https://deno.land/x/bcrypt/mod.ts"; //criptografia e usuarios
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

//db.execute(`DELETE FROM chats WHERE id = 2;`) <-- apagar grupo
//BLOB --> dados binarios para armazenamento de arquivos

// Run a simple query
/*for (const name of ["Peter Parker", "Clark Kent", "Bruce Wayne"]) {
  db.query("INSERT INTO chats (name) VALUES (?)", [name]);
}*/

// Print out data in table
/*for (const [name] of db.query("SELECT name FROM chats")) {
  console.log(name);
}*/

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

app.use(async (context) => {
  try {
    const path = new URL(context.request.url).pathname;
    switch (path) {
      case "/login":
        await send(context, './view/login.ejs');
        break;
      case "/signup":
        await send(context, './view/signUp.ejs');
        break;
      case "/receber":
        context.response.body = { chats: db.query("SELECT name, id FROM chats") };
        break;
      case "/enviar":
        await sendData(context)();
        break;
      default:
        await send(context, path, {
          root: `${Deno.cwd()}/public`,
          index: "index.html",
        });
    }
  } catch (error) {
    function HTTPError(e, m = e) {
      context.response.status = e;
      context.response.body = m;
    }
    switch (error.status) {
      case 404:
        HTTPError(error.status, "Not Found ( ﾉ ﾟｰﾟ)ﾉ");
        await send(context, './view/404.htm');
        break;
      case 403:
        HTTPError(error.status, "Forbidden");
        await send(context, './view/403.htm');
        break;
      case 500:
        HTTPError(error.status, "Internal Server Error :(");
        await send(context, './view/500.htm');
        break;
      default:
        HTTPError(error.status);
    }
  }
});

//app.use(router.routes());
//app.use(router.allowedMethods());
app.use(errorHandler);

console.log('HTTP server running. Access it at: ' + yellow(`http://localhost:${port}/`));

await app.listen({
  port: port,
  secure: true,
  //keyFile: "./examples/tls/localhost.key",
  //certFile: "./examples/tls/localhost.crt"
});

//deno run -A server.ts

//db.close();