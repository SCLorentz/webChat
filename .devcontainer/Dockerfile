# Build stage
FROM debian:bullseye-slim AS builder

COPY cmd/setup.sh /setup.sh
RUN bash /setup.sh
RUN rm /setup.sh

# Final stage
FROM debian:bullseye-slim AS final

# Copiar arquivos com base no paths.json
COPY --from=builder /root/.cargo /root/.cargo
COPY --from=builder /root/.rustup /root/.rustup
COPY --from=builder /root/.deno /root/.deno
COPY --from=builder /usr/local/go /usr/local/go

COPY cmd/.bash /bash
COPY cmd/run.sh /run.sh

# Set up deno, rust and go paths
ENV PATH="/root/.deno/bin:/root/.cargo/bin:/usr/local/go/bin:${PATH}"
ENV RUSTUP_HOME="/root/.rustup"
ENV CARGO_HOME="/root/.cargo"

ENV FLASK_APP=zagware

COPY cmd/build.sh /build.sh
RUN bash /build.sh && rm /build.sh

WORKDIR /app
EXPOSE 8000

CMD ["/bin/bash", "-c", "flask run --host 0.0.0.0 --port 8000"]