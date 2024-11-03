package cmd

import (
	"fmt"
	"os"
	"webchat/server"
	"time"
)

func Start() {
	// esperar o servidor ser iniciado
	for !server.IsServerRunning() {
		fmt.Println("waiting for the server to start...")
		time.Sleep(time.Second)
	}

	for {
		var i string

		fmt.Print("> ")
		fmt.Scan(&i)

		if i == "ext" {
			fmt.Println("exiting...")
			// Todo: add a way to cancel the process with a timer of 5 seconds, but make it configurable
			os.Exit(0)
		}

		// Todo: add a way to restart only the server function
	}
}