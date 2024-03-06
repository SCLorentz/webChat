# Use a imagem base do Deno
FROM hayd/deno:1.7.0

# Copie o código do aplicativo para o container
COPY . /app

# Defina o diretório de trabalho
WORKDIR /app

# Instale as dependências
RUN deno cache main.ts

EXPOSE 8080

# Defina o comando de execução
CMD ["deno", "run", "--allow-net", "server.ts"]