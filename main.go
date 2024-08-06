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
	"time"
	//"regexp"
)

type ErrorTemplate struct {
	Template *template.Template
}

type File struct {
	Folder string
}

func genTemplate(err int) *template.Template {
	return template.Must(template.ParseFiles("templates/err/" + fmt.Sprintf("%d", err) + ".html"))
}

var errorTemplates = map[int]ErrorTemplate {
	// Todo: get the files e generate the templates automatically
	401: {genTemplate(401)}, // Unauthorized
	403: {genTemplate(403)}, // Forbidden
	404: {genTemplate(404)}, // Not Found
	418: {genTemplate(418)}, // I'm a teapot
	500: {genTemplate(500)}, // Internal Server Error
	501: {genTemplate(501)}, // Not Implemented
	508: {genTemplate(508)}, // Loop Detected
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

func send(path string, w http.ResponseWriter, file_type string) {
	Folder := "./public/" + path
	_, error := os.Stat(Folder)
	exist := !errors.Is(error, os.ErrNotExist)

	if !exist {
		errHandler(w, 404)
		//fmt.Println("error 404: " + Folder + " from: " + r.Header.Get("Referer"))
		return
	}
	
	// Open the file and check for errors
	file, err := os.Open(Folder)
	if err != nil {
		fmt.Println("Erro ao abrir o arquivo:", err)
		errHandler(w, 500)
		return
	}
	defer file.Close() // Close the file even on errors

	// Get the file size
	info, err := os.Stat(Folder)
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
			file_type = "text/javascript"
		case "wasm":
			file_type = "application/wasm"
		case "static":
			file_type = "text/html"
		case "scripts":
			file_type = "application/javascript"
		default:
			file_type = "text/" + file_type
	}

	w.Header().Set("Content-Type", file_type)
	w.Write([]byte(data[:count]))
}

func terminal() {
	for {
		var i string

		fmt.Print("> ")
		fmt.Scan(&i)

		if i == "ext" {
			fmt.Println("exiting...")
			count := 5;

			for i := 0; i < 5; i++ {
				fmt.Println("closing in " + fmt.Sprintf("%d", count)  + "...")
				count -= 1
				// Todo: add a way to cancel the process
				time.Sleep(1 * time.Second)
			}
			fmt.Println("closing...")
			os.Exit(0)
		}
	}
}

func server() {
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
			send("index.html", w, "html")
			return
		}

		// verify if the user can access directly the file, remember, the code is public and it can be acessed in the devtools or in my github
		// TODO: create a better way to do this
		// reimplement the static file load without the file extension
		redirect := map[string]File {
			// Todo: get the files e generate the templates automatically
			"png": {Folder: "img"},
			"ico": {Folder: "img"},
			"svg": {Folder: "img/svg"},
			"woff2": {Folder: "fonts"},
			"webmanifest": {Folder: "static"},
			"html": {Folder: "static"},
			"js": {Folder: "scripts"},
			//"": {Folder: "static"},
		}

		if template, ok := redirect[file]; ok {
			file = template.Folder
		}
		
		if file != "static" && r.Header.Get("Referer") == "" {
			fmt.Println(file)
			errHandler(w, 403)
			return
        }

		// other custom routes
		if path == "/webchat" {
			send("/wasm/webchat.js", w, "js")
			return
		}

		url := file + r.URL.Path
		send(url, w, file)
	})

	http.HandleFunc("/receber", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte("{ chats: [name: \"chat1\", id: \"59\", img: \"no_image_available\"] }"))
	})

	http.HandleFunc("/enviar", func(w http.ResponseWriter, r *http.Request) {
		// TODO: implement this
		// get the data from the request
		/*ata := r.FormValue("data")
		fmt.Println(data)
		w.Write([]byte("ok"))*/
		errHandler(w, 501)
	})

	if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatal(err)
    }
}

func main() {
	go server()
	go terminal()

	select {}
}