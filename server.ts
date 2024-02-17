import { Application, Context, send, Router } from 'https://deno.land/x/oak/mod.ts'; //Servidor
import { bold, cyan, green, yellow } from "https://deno.land/std@0.200.0/fmt/colors.ts"; //console
import { DB } from "https://deno.land/x/sqlite/mod.ts"; //database
//import { indexedDB } from "https://deno.land/x/indexeddb@v1.1.0/ponyfill.ts";
//import { compare, hash } from "https://deno.land/x/bcrypt/mod.ts"; //criptografia e usuarios
//import * as dejs from "https://deno.land/x/dejs@0.10.3/mod.ts"; //ejs
//Uma opção ao css ou scss é o https://tailwindcss.com/

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
    guests TEXT,
    creation DATETIME,
    description TEXT,
    adms TEXT,
    creator TEXT,
    img BLOB
  )
`);
//Msgs
db.execute(`
  CREATE TABLE IF NOT EXISTS msgs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    groupid TEXT,
    content Text,
    creation DATETIME,
    file BLOB
  )
`);
//BLOB --> dados binarios para armazenamento de arquivos

// Run a simple query
/*for (const name of ["Peter Parker", "Clark Kent", "Bruce Wayne"]) {
  db.query("INSERT INTO chats (name) VALUES (?)", [name]);
}*/

// Print out data in table
for (const [name] of db.query("SELECT name FROM chats")) {
  console.log(name);
}

app.use(async (context) => {
  try {
    //mover para routes
    const path = new URL(context.request.url).pathname;
    switch (path) {
      case "/login":
        await send(context, './view/login.ejs');
        break
      case "/signup":
        await send(context, './view/signUp.ejs');
        break
      case "/receber":
        context.response.body = { chats: db.query("SELECT name FROM chats") };
        break
      case "/enviar": //enviar dados para o servidor
        const body = await context.request.body();
        if (body.type === "json") {
          const data = await body.value;
          try {
            db.query("INSERT INTO chats (name, creation) VALUES (?, ?)", [data.name, data.date]);
            context.response.body = { message: "Dados recebidos com sucesso! :)" };
          } catch (error) {
            console.error('Erro ao executar a consulta SQL:', error);
            context.response.body = { message: "Erro ao inserir dados no banco de dados" };
          }          
        } else {
          context.response.status = 400;
          context.response.body = { message: "ooops, parece que algo deu errado! :(" };
        }
        break
      default:
        await send(context, path, {
          root: `${Deno.cwd()}/public`,
          index: "index.ejs",
        });
    }
  } catch (error) {
    function HTTPError(e, m = e) {
      context.response.status = e;
      context.response.body = m;
    }
    switch (error.status) {
      case 404:
        HTTPError(error.status, "Not Found ( ﾉ ﾟｰﾟ)ﾉ")
        await send(context, './view/404.htm');
        break
      case 403:
        HTTPError(error.status, "Forbidden",)
        await send(context, './view/403.htm');
        break
      case 500:
        HTTPError(error.status, "Internal Server Error :(")
        await send(context, './view/500.htm');
        break
      default:
        HTTPError(error.status)
    }
    //Outros erros:
      //503 -> serviço indisponivel
    //
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
});

//db.close();