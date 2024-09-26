#!/bin/bash

# Kill any running server
pkill -f webchat

# Install dependencies
npm install

# Build WASM
echo "Building WASM..."
npm run build:wasm

# Build frontend
echo "Building frontend..."
npm run build

# Build Go server
echo "Building server..."
cd ./src/backend
go mod tidy
go build -o ./webchat ./main.go

# Start server
echo "Starting server..."
./webchat