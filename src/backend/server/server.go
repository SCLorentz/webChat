package server

//https://www.digitalocean.com/community/tutorials/how-to-make-an-http-server-in-go
//https://blog.logrocket.com/creating-a-web-server-with-golang/

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"webchat/config"
	//"encoding/json"
)

type File struct {
	Folder string
}

func send(path string, w http.ResponseWriter, file_type string) {
	// get the file path based on the project path
	Folder := "../public/" + path
	_, error := os.Stat(Folder)
	exist := !errors.Is(error, os.ErrNotExist)

	if !exist {
		config.Err(w, 404)
		//fmt.Println("error 404: " + Folder + " from: " + r.Header.Get("Referer"))
		return
	}

	// Open the file and check for errors
	file, err := os.Open(Folder)
	if err != nil {
		fmt.Println("Erro ao abrir o arquivo:", err)
		config.Err(w, 500)
		return
	}
	defer file.Close() // Close the file even on errors

	// Get the file size
	info, err := os.Stat(Folder)
	if err != nil {
		fmt.Println("Erro ao obter informações do arquivo:", err)
		config.Err(w, 500)
		return
	}

	// Read the file content
	data := make([]byte, info.Size())
	count, err := file.Read(data)
	if err != nil {
		fmt.Println("Erro ao ler o arquivo:", err)
		config.Err(w, 500)
		return
	}

	//fmt.Printf("read %d bytes: %q\n", count, data[:count])
	w.Header().Set("Content-Type", config.Mime(file_type))
	w.Write([]byte(data[:count]))
}

func Start() {
	// file handle
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Extraindo o caminho do arquivo da URL
		path := r.URL.Path

		// gemini helped me with this, but I have modifiied it
		// transformar em algo mais parecido com o meus codigos em rust com o equivalente de Some() e None()
		lastIndex := strings.LastIndexByte(path, '.')
		file := ""
		if lastIndex > 0 && lastIndex < len(path)-1 {
			file = strings.ToLower(path[lastIndex+1:])
		}

		// the most important route
		if path == "/" {
			send("index.html", w, "html")
			return
		}

		// verify if the user can access directly the file, remember, the code is public and it can be acessed in the devtools or in my github
		// TODO: create a better way to do this
		// reimplement the static file load without the file extension
		redirect := map[string]File{
			// Todo: get the files e generate the templates automatically
			"png":         	{Folder: "img"},
			"ico":         	{Folder: "img"},
			"svg":         	{Folder: "img/svg"},
			"woff2":       	{Folder: "fonts"},
			"webmanifest": 	{Folder: "static"},
			"html":        	{Folder: "static"},
			"js":          	{Folder: "scripts"},
			"wasm": 	   	{Folder: "scripts/frontend"},
			//"": {Folder: "static"},
		}

		if template, ok := redirect[file]; ok {
			file = template.Folder
		}

		if file != "static" && r.Header.Get("Referer") == "" {
			fmt.Println(file)
			config.Err(w, 403)
			return
		}

		url := file + r.URL.Path
		send(url, w, file)
	})

	http.HandleFunc("/get_data", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte("{ chats: [name: \"chat1\", id: \"59\", img: \"no_image_available\"] }"))
	})

	http.HandleFunc("/save_data", func(w http.ResponseWriter, r *http.Request) {
		// TODO: implement this
		// get the data from the request
		/*ata := r.FormValue("data")
		fmt.Println(data)
		w.Write([]byte("ok"))*/
		config.Err(w, 501)
	})

	/*// Open our jsonFile
	jsonFile, err := os.Open("./server/server.json")
	// if we os.Open returns an error then handle it
	if err != nil {
	fmt.Println(err)
	}
	fmt.Println("Successfully Opened users.json")
	// defer the closing of our jsonFile so that we can parse it later on
	defer jsonFile.Close()*/

	fmt.Println("The server has started successfully in http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}