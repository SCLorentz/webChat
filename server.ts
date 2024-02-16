import { Application, Context, send } from 'https://deno.land/x/oak/mod.ts'; //Servidor
import { bold, cyan, green, yellow } from "https://deno.land/std@0.200.0/fmt/colors.ts"; //console
import { DB } from "https://deno.land/x/sqlite/mod.ts"; //database
//import { compare, hash } from "https://deno.land/x/bcrypt/mod.ts"; //criptografia e usuarios
//import * as dejs from "https://deno.land/x/dejs@0.10.3/mod.ts"; //ejs
//Uma opção ao css ou scss é o https://tailwindcss.com/

const port = 8080;
const app = new Application({ keys: ["data"] });
const db = new DB('./database/data.db');
const ejs = require('ejs');

db.execute(`
  CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    users TEXT,
    settings TEXT
  )
`);

// Run a simple query
/*for (const name of ["Peter Parker", "Clark Kent", "Bruce Wayne"]) {
  db.query("INSERT INTO people (name) VALUES (?)", [name]);
}*/

// Print out data in table
for (const [name] of db.query("SELECT name FROM people")) {
  console.log(name);
}

// Close connection
db.close();

app.use(async (context) => {
  try {
    const path = new URL(context.request.url).pathname;
    switch (path) {
      case "/login":
        await send(context, './view/login.ejs');
        break
      case "/dados":
        //context.response.body = "hello";
        console.log("FUNCIONOU PORRA!");
        break
      default:
        await send(context, path, {
          root: `${Deno.cwd()}/public`,
          index: "index.ejs",
        });
    }
  } catch (error) {
    function HTTPError(e, m = e, vPath) {
      context.response.status = e;
      context.response.body = m;
    }
    switch (error.status) {
      case 404:
        HTTPError(error.status, "Not Found ( ﾉ ﾟｰﾟ)ﾉ")
        await send(context, './view/404.ejs');
        break
      case 403:
        HTTPError(error.status, "Forbidden",)
        await send(context, './view/403.ejs');
        break
      case 500:
        HTTPError(error.status, "Internal Server Error :(")
        await send(context, './view/500.ejs');
        break
      default:
        HTTPError(error.status)
    }
    /*Outros erros:
      503 -> serviço indisponivel
    */
  }
});

console.log('HTTP server running. Access it at: ' + yellow(`http://localhost:${port}/`));

await app.listen({
  port: port,
  secure: true,
  //keyFile: "./examples/tls/localhost.key",
});