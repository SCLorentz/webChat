// não usado, mas futuramente pode ser usado para tratar erros de path do usuário
import { Context, Status } from "https://deno.land/x/oak@v16.1.0/mod.ts";

export const errorHandler = async (context: Context, next: () => Promise<void>) => {
  try {
    await next();
  } catch (_error) {
    // Tratamento de erros centralizado
    context.response.status = Status.InternalServerError;
    context.response.body = "Ocorreu um erro interno no servidor";
  }
};