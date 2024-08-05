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

var err404 *template.Template
var err500 *template.Template
var err403 *template.Template

func init() {
    err404 = template.Must(template.ParseFiles("templates/err/404.html"));
	err500 = template.Must(template.ParseFiles("templates/err/500.html"));
	err403 = template.Must(template.ParseFiles("templates/err/403.html"));
}

func errorHandler(w http.ResponseWriter, _ *http.Request, err int, template *template.Template) {
	w.WriteHeader(err)
	template.Execute(w, nil)
}

func send(path string, w http.ResponseWriter, r *http.Request, file_type string) {
	filename := "./public/" + path
	_, error := os.Stat(filename)
	exist := !errors.Is(error, os.ErrNotExist)

	if !exist {
		errorHandler(w, r, http.StatusNotFound, err404)
		fmt.Println("error 404: " + filename + " from: " + r.Header.Get("Referer"))
		return
	}
	
	// Open the file and check for errors
	file, err := os.Open(filename)
	if err != nil {
		fmt.Println("Erro ao abrir o arquivo:", err)
		errorHandler(w, r, http.StatusInternalServerError, err500)
		return
	}
	defer file.Close() // Close the file even on errors

	// Get the file size
	info, err := os.Stat(filename)
	if err != nil {
		fmt.Println("Erro ao obter informações do arquivo:", err)
		errorHandler(w, r, http.StatusInternalServerError, err500)
		return
	}

	// Read the file content
	data := make([]byte, info.Size())
	count, err := file.Read(data)
	if err != nil {
		fmt.Println("Erro ao ler o arquivo:", err)
		errorHandler(w, r, http.StatusInternalServerError, err500)
		return
	}

	//fmt.Printf("read %d bytes: %q\n", count, data[:count])
	// send the file content
	switch file_type {
		case "js":
			w.Header().Set("Content-Type", "text/javascript")
		case "wasm":
			w.Header().Set("Content-Type", "application/wasm")
		case "static":
			w.Header().Set("Content-Type", "text/html")
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

		// gemini helped me with this, but I have modifiied it
		// transformar em algo mais parecido com o meus codigos em rust com o equivalente de Some() e None()
		lastIndex := strings.LastIndexByte(path, '.')
		file := ""
        if lastIndex > 0 && lastIndex < len(path) - 1 { file = strings.ToLower(path[lastIndex + 1:]) }

		// the most important route
		if path == "/" {
			send("index.html", w, r, "html")
			return
		}

		extension := ""
		// verify if the user can access directly the file, remember, the code is public and it can be acessed in the devtools or in my github
		switch file {
			case "html":
				file = "static"
			case "":
				file = "static"
				extension = ".html"
		}
		
		if file != "static" && r.Header.Get("Referer") == "" {
			fmt.Println(file)
			errorHandler(w, r, http.StatusForbidden, err403)
			return
        }

		// other custom routes
		if path == "/webchat" {
			send("/wasm/webchat.js", w, r, "js")
			return
		}

		url := file + r.URL.Path + extension
		send(url, w, r, file)
	})

	if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatal(err)
    }
}