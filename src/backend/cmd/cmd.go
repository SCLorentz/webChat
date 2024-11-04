package cmd

import (
	"fmt"
	"os"
	"webchat/server"
	"time"
	"github.com/eiannone/keyboard"
)

func Start() {
	// esperar o servidor ser iniciado
	for !server.IsServerRunning() {
		fmt.Println("waiting for the server to start...")
		time.Sleep(time.Second)
	}

	fmt.Println("\n\x1b[42m- session started -\033[0m")

	for {
		fmt.Print(fmt.Sprintf("\n\x1b[1mADMIN: \033[0m"))
		var i string

		fmt.Scanln(&i)
		if i == "" {
			continue
		}

		if i == "ext" {
			exit(5)
		}

		// Todo: create a better method to do this, implement with support for args like: '--time 5'

		switch i {
			case "restart":
				fmt.Print("\n\x1b[1mTERMINAL:\033[0m not implemented yet\n")
			case "exit":
				exit(5)
		}

		/*
		Commands:
		- restart the server without restarting the terminal
		- configure the exit time
		- shutdown the program
		- configure a new port for the server (needs to restart)
		*/
	}
}

func exit(sec int) {
	fmt.Println("\n\n\x1b[42m- Shut down the server -\033[0m")
	fmt.Print("\n\x1b[1mTERMINAL:\033[0m confirm the operation: ")
	//
	char, _, err := keyboard.GetSingleKey()
	if (err != nil) {
		panic(err)
	}
	if char != 'y' {
		fmt.Print("canceled\n")
		return
	}
	fmt.Println("\n\x1b[1mTERMINAL:\033[0m confirmed, shutting down the server...")
	//
	cancel := make(chan struct{})
	go func() {
		char, _, err := keyboard.GetSingleKey()
		if (err != nil) {
			panic(err)
		}
		if char == '\x00' {
			close(cancel)
		}
	}()
	
	fmt.Println(fmt.Sprintf("\x1b[3mpress 'esc' to cancel\x1b[0m"))

	for t := sec; t > 0; t-- {
		select {
		case <-cancel:
			fmt.Println("\n\n\x1b[42m- exit canceled -\033[0m")
			return
		default:
			fmt.Print(fmt.Sprintf("\n\x1b[1mTERMINAL:\033[0m exiting in %ds...", t))
			time.Sleep(time.Second)
		}
	}
	fmt.Println("\n\n\x1b[41m- session finished -\033[0m")
	keyboard.Close()
	close(cancel)
	//
	os.Exit(0)
}