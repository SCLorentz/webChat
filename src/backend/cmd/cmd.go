package cmd

import (
	"fmt"
	"os"
)

func Terminal() {
	for {
		var i string

		fmt.Print(":> ")
		fmt.Scan(&i)

		if i == "ext" {
			fmt.Println("exiting...")
			// Todo: add a way to cancel the process with a timer of 5 seconds, but make it configurable
			os.Exit(0)
		}
	}
}