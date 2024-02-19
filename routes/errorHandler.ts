// Arquivo: errorHandler.ts
import { Context, Status } from "https://deno.land/x/oak/mod.ts";

export const errorHandler = async (context: Context, next: () => Promise<void>) => {
  try {
    await next();
  } catch (error) {
    // Tratamento de erros centralizado
    context.response.status = Status.InternalServerError;
    context.response.body = "Ocorreu um erro interno no servidor";
  }
};