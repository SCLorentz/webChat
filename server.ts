import { Application, Context, send, Router } from 'https://deno.land/x/oak/mod.ts';
import { bold, cyan, green, yellow } from "https://deno.land/std@0.200.0/fmt/colors.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const port = 8080;
const app = new Application({ keys: ["data"] });
const db = new DB('./database/data.db');

db.execute(`
  CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    users TEXT,
    settings TEXT
  )
`);

// Create a new router
const router = new Router();

router.get("/data", async (context) => {
  const data = [];
  for (const [name] of db.query("SELECT name FROM users")) {
    data.push({ name });
  }
  context.response.body = data;
});

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

    await send(context, path, {
      root: `${Deno.cwd()}/public`,
      index: "index.html",
    });
  } catch (error) {
    // Se o arquivo não for encontrado, retornamos um erro 404.
    context.response.status = 404;
    context.response.body = "Not Found";
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log('HTTP server running. Access it at: ' + yellow(`http://localhost:${port}/`));

await app.listen({
  port: port,
  secure: true,
  //keyFile: "./examples/tls/localhost.key",
});