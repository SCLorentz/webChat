//https://www.digitalocean.com/community/tutorials/how-to-make-an-http-server-in-go
//https://blog.logrocket.com/creating-a-web-server-with-golang/

package main

import (
	"html/template"
	"fmt"
	"net/http"
	"log"
	"strings"
)

var tpl *template.Template

func init() {
    tpl = template.Must(template.ParseFiles("templates/err/404.html"));
}

func custom404Handler(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusNotFound)
	tpl.Execute(w, nil)
}

func main() {
    fmt.Println("The server has started successfully in http://localhost:8080")
	// file handle
	fileServer := http.FileServer(http.Dir("./public"))
	script := http.FileServer(http.Dir("./public/script"))
	css := http.FileServer(http.Dir("./public/style"))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Extraindo o caminho do arquivo da URL
		path := r.URL.Path

		if r.URL.Path != "/" {
			custom404Handler(w, r)
			return
		}
	
		switch strings.ToLower(path[strings.LastIndexByte(path, '.')+1:]) {
			case "js":
				script.ServeHTTP(w, r)
			case "css":
				css.ServeHTTP(w, r)
			default:
				fileServer.ServeHTTP(w, r)
		}
	})

	http.HandleFunc("/059", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte("<h1>59</h1>"))
	})

	if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatal(err)
    }
}