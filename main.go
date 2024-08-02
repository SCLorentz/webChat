//https://www.digitalocean.com/community/tutorials/how-to-make-an-http-server-in-go
//https://blog.logrocket.com/creating-a-web-server-with-golang/

package main

import (
	"fmt"
	"net/http"
	"log"
	"strings"
)

func main() {
    fmt.Println("The server has started successfully in http://localhost:8080")
	// file handle
	fileServer := http.FileServer(http.Dir("./public"))
	script := http.FileServer(http.Dir("./public/script"))
	css := http.FileServer(http.Dir("./public/style"))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Extraindo o caminho do arquivo da URL
		path := r.URL.Path
	
		switch strings.ToLower(path[strings.LastIndexByte(path, '.')+1:]) {
		case "js":
			script.ServeHTTP(w, r)
		case "css":
			css.ServeHTTP(w, r)
		default:
			fileServer.ServeHTTP(w, r)
		}
	})

	if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatal(err)
    }
}