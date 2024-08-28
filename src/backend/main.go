package main

import (
	"webchat/cmd"
	"webchat/server"
)

func main() {
	go server.Start()
	// execute the terminal without closing the server
	// fix the issue that makes the '>' appears before the server starts
	go cmd.Start()

	select {}
}