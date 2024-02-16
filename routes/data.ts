// Arquivo: routes.ts
import { Router, Context } from "https://deno.land/x/oak/mod.ts";

const router = new Router();

router.post("/receber", async (context) => {
  context.response.body = { message: "Dados enviados para o front-end" };
});

router.post("/enviar", async (context) => {
  const body = await context.request.body();
  if (body.type === "json") {
    const data = await body.value;
    context.response.body = { message: "Dados recebidos com sucesso! :)" };
    console.log(data);
  } else {
    const userAgent = context.request.headers.get("user-agent");
    if (userAgent.includes("Mozilla")) {
      context.response.status = 400;
      context.response.body = { message: "ooops, parece que algo deu errado! :(" };
    } else {
      context.response.status = 400;
      context.response.body = { message: "ooops, parece que você está tentando acessar uma página inválida! :(" };
    }
  }
});

export default router;