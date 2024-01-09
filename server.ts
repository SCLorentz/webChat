import { Application, Context, send } from 'https://deno.land/x/oak/mod.ts';
import { bold, cyan, green, yellow } from "https://deno.land/std@0.200.0/fmt/colors.ts";
//
import file from "./database/chat.json" with { type: "json" };
const filePath = './database/chat.json';

const port = 8080;
const app = new Application({ keys: ["secret1"] });

app.use(async (context, next) => {
  if (context.request.method === 'POST') {
    const body = await context.request.body().value;
    context.response.body = 'Recebido com sucesso!\n';
    try {
      const jsonData = typeof body === 'string' ? JSON.parse(body) : body;
      const existingData = file.find(item => item.id === jsonData.id);
      if (existingData) {
        // Atualiza o valor se o id já existe no arquivo
        existingData.value = jsonData.value;
        console.log('Dado atualizado:', existingData);
      } else {
        // Adiciona o novo dado ao array no arquivo JSON
        file.push(jsonData);
        console.log('Novo dado adicionado:', jsonData);
      }
      // Salva as alterações de volta no arquivo
      await Deno.writeTextFile(filePath, JSON.stringify(file));
      context.response.body = 'Recebido e armazenado com sucesso!\n';
    } catch (error) {
      console.error('Erro ao processar JSON:', error);
      context.response.status = 400;
      context.response.body = 'Erro ao processar JSON.\n';
    }
  } else {
    await next();
  }
});

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

console.log('HTTP server running. Access it at: ' + yellow(`http://localhost:${port}/`));

await app.listen({
  port: port,
  secure: true,
  //keyFile: "./examples/tls/localhost.key",
});