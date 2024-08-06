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

type ErrorTemplate struct {
	Template *template.Template
}

func genTemplate(err int) *template.Template {
	return template.Must(template.ParseFiles("templates/err/" + fmt.Sprintf("%d", err) + ".html"))
}

var errorTemplates = map[int]ErrorTemplate {
	401: {genTemplate(401)},
	403: {genTemplate(403)},
	404: {genTemplate(404)},
	500: {genTemplate(500)},
	501: {genTemplate(501)},
}

func errHandler(w http.ResponseWriter, err int) {
	// retornar a função para poder eviter usar 'errHandler(w, 500)' e no lugar usar 'errHandler(500)', sem a necessidade do 'http.ResponseWriter'
	//fmt.Println("error file: " + errorTemplates[err].Template.Name())
	if template, ok := errorTemplates[err]; ok {
		w.WriteHeader(err)
		template.Template.Execute(w, nil)
		return
	}
	// Handle unexpected errors here
	err_msg := "Internal Server Error, this is an err inside the err handler, te original err was: " + fmt.Sprintf("%b", err);
	http.Error(w, err_msg, 500)
}

func send(path string, w http.ResponseWriter, _ *http.Request, file_type string) {
	filename := "./public/" + path
	_, error := os.Stat(filename)
	exist := !errors.Is(error, os.ErrNotExist)

	if !exist {
		errHandler(w, 404)
		//fmt.Println("error 404: " + filename + " from: " + r.Header.Get("Referer"))
		return
	}
	
	// Open the file and check for errors
	file, err := os.Open(filename)
	if err != nil {
		fmt.Println("Erro ao abrir o arquivo:", err)
		errHandler(w, 500)
		return
	}
	defer file.Close() // Close the file even on errors

	// Get the file size
	info, err := os.Stat(filename)
	if err != nil {
		fmt.Println("Erro ao obter informações do arquivo:", err)
		errHandler(w, 500)
		return
	}

	// Read the file content
	data := make([]byte, info.Size())
	count, err := file.Read(data)
	if err != nil {
		fmt.Println("Erro ao ler o arquivo:", err)
		errHandler(w, 500)
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
			errHandler(w, 403)
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