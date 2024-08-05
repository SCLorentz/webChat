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

var tpl *template.Template

func init() {
    tpl = template.Must(template.ParseFiles("templates/err/404.html"));
}

func custom404Handler(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusNotFound)
	tpl.Execute(w, nil)
}

func send(path string, w http.ResponseWriter, r *http.Request, page http.Handler) {
	_, error := os.Stat(path)
	exist := !errors.Is(error, os.ErrNotExist)

	if exist {
		page.ServeHTTP(w, r)
		return
	}
	custom404Handler(w, r)
}

func main() {
    fmt.Println("The server has started successfully in http://localhost:8080")
	// file handle
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Extraindo o caminho do arquivo da URL
		path := r.URL.Path
		file := strings.ToLower(path[strings.LastIndexByte(path, '.')+1:])

		if file == "html" {
			file = "static"
		}
		//fmt.Println("path:", file + r.URL.Path)
		
		send(file + r.URL.Path, w, r, http.FileServer(http.Dir("./public/" + file)))
	})

	http.HandleFunc("/059", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte("<h1>59</h1>"))
	})

	// por algum motivo, essa foi a unica forma de enviar o script que funcionou
	http.HandleFunc("/webchat", func(w http.ResponseWriter, r *http.Request) {
		filename := "./public/script/webchat.js"

		// Open the file and check for errors
		file, err := os.Open(filename)
		if err != nil {
			fmt.Println("Erro ao abrir o arquivo:", err)
			return
		}
		defer file.Close() // Close the file even on errors

		// Get the file size
		info, err := os.Stat(filename)
		if err != nil {
			fmt.Println("Erro ao obter informações do arquivo:", err)
			return
		}

		// Read the file content
		data := make([]byte, info.Size())
		count, err := file.Read(data)
		if err != nil {
			fmt.Println("Erro ao ler o arquivo:", err)
			return
		}

		//fmt.Printf("read %d bytes: %q\n", count, data[:count])
		// send the file content
		w.Header().Set("Content-Type", "text/javascript")
		w.Write([]byte(data[:count]))
	})

	if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatal(err)
    }
}