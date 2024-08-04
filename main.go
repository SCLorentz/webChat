//https://www.digitalocean.com/community/tutorials/how-to-make-an-http-server-in-go
//https://blog.logrocket.com/creating-a-web-server-with-golang/

package main

import (
	"html/template"
	"fmt"
	"net/http"
	"log"
	"strings"
	"errors"
	"os"
)

func checkFileExists(filePath string) bool {
	_, error := os.Stat(filePath)
	//return !os.IsNotExist(err)
	return !errors.Is(error, os.ErrNotExist)
}

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
		//fmt.Println("path:", path)
	
		switch strings.ToLower(path[strings.LastIndexByte(path, '.')+1:]) {
			case "js":
				if checkFileExists("./public/script" + r.URL.Path) {
					script.ServeHTTP(w, r)
					return
				}
				fmt.Println("404")
				custom404Handler(w, r)
			case "css":
				if checkFileExists("./public/style" + r.URL.Path) {
					css.ServeHTTP(w, r)
					return
				}
				custom404Handler(w, r)
			default:
				if checkFileExists(r.URL.Path) {
					fileServer.ServeHTTP(w, r)
					return
				}
				custom404Handler(w, r)
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