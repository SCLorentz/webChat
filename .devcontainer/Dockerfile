# Build stage
FROM debian:bullseye-slim AS builder

RUN apt-get update && apt-get install -y wget unzip curl \
    # Install Rust
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable \
    && . $HOME/.cargo/env \
    && rustup default stable \
    # Install Deno
    && wget https://deno.land/x/install/install.sh \
    && sh install.sh \
    # Install Go
    && wget https://golang.org/dl/go1.21.3.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go1.21.3.linux-amd64.tar.gz \
    && rm go1.21.3.linux-amd64.tar.gz install.sh

# Final stage
FROM debian:bullseye-slim AS final

# Copiar arquivos com base no paths.json
COPY --from=builder /root/.cargo /root/.cargo
COPY --from=builder /root/.rustup /root/.rustup
COPY --from=builder /root/.deno /root/.deno
COPY --from=builder /usr/local/go /usr/local/go

COPY cmd/ /root/

# Set up deno, rust and go paths
ENV PATH="/root/.deno/bin:/root/.cargo/bin:/usr/local/go/bin:${PATH}" \
    RUSTUP_HOME="/root/.rustup" \
    CARGO_HOME="/root/.cargo" \
    FLASK_APP=ch6

RUN apt-get update && apt-get install -y git gcc \
    && cargo install wasm-pack \
    && rm -rf /root/.bashrc \
    && mv /root/bash /root/.bashrc

EXPOSE 8000

CMD ["/bin/bash", "-c", "flask run --host 0.0.0.0 --port 8000"]