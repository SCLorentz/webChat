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
var internal_err *template.Template

func init() {
    tpl = template.Must(template.ParseFiles("templates/err/404.html"));
	internal_err = template.Must(template.ParseFiles("templates/err/500.html"));
}

func custom404Handler(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusNotFound)
	tpl.Execute(w, nil)
}

func custom500Handler(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusNotFound)
	internal_err.Execute(w, nil)
}

func send(path string, w http.ResponseWriter, r *http.Request, file_type string) {
	filename := "./public/" + path
	_, error := os.Stat(filename)
	exist := !errors.Is(error, os.ErrNotExist)

	if !exist {
		custom404Handler(w, r)
		fmt.Println(filename)
		return
	}
	
	// Open the file and check for errors
	file, err := os.Open(filename)
	if err != nil {
		fmt.Println("Erro ao abrir o arquivo:", err)
		custom500Handler(w, r)	// change to 500 error
		return
	}
	defer file.Close() // Close the file even on errors

	// Get the file size
	info, err := os.Stat(filename)
	if err != nil {
		fmt.Println("Erro ao obter informações do arquivo:", err)
		custom500Handler(w, r) // change to 500 error
		return
	}

	// Read the file content
	data := make([]byte, info.Size())
	count, err := file.Read(data)
	if err != nil {
		fmt.Println("Erro ao ler o arquivo:", err)
		custom500Handler(w, r)	// change to 500 error
		return
	}

	//fmt.Printf("read %d bytes: %q\n", count, data[:count])
	// send the file content
	switch file_type {
		case "js":
			w.Header().Set("Content-Type", "text/javascript")
		case "wasm":
			w.Header().Set("Content-Type", "application/wasm")
		default:
			w.Header().Set("Content-Type", "text/" + file_type)
	}
	
	w.Write([]byte(data[:count]))
}

func main() {
    fmt.Println("The server has started successfully in http://localhost:8080")
	// file handle
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Extraindo o caminho do arquivo da URL
		path := r.URL.Path
		file := strings.ToLower(path[strings.LastIndexByte(path, '.')+1:])
		url := file + r.URL.Path

		if path == "/" {
			send("index.html", w, r, "html")
			return
		}
		
		if file == "html" {
			file = "static"
		}

		//fmt.Println("path:", file + r.URL.Path)
		
		send(url, w, r, file)
	})

	// por algum motivo, essa foi a unica forma de enviar o script que funcionou
	http.HandleFunc("/webchat", func(w http.ResponseWriter, r *http.Request) {
		send("/wasm/webchat.js", w, r, "js")
	})

	if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatal(err)
    }
}