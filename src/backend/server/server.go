package server

//https://www.digitalocean.com/community/tutorials/how-to-make-an-http-server-in-go
//https://blog.logrocket.com/creating-a-web-server-with-golang/

import (
	"errors"
	"fmt"
	"log"
	//
	//"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"
	// my packages
	"compress/gzip"
	"webchat/conf"
	//"webchat/database"
)

type File struct {
	Folder string
	Mime string
}

func sendGzip(w http.ResponseWriter, r *http.Request, mime string, path string) error {
	File := "../frontend/" + path
	// Verifica se o cliente aceita compressão Gzip
	if !isGzipAccepted(r) {
		//http.Error(w, "Not Acceptable", http.StatusNotAcceptable) // err 406
		send(path, w, mime)
		return errors.New("not acceptable! Sending uncompressed file")
	}

	// Cria um escritor gzip
	w.Header().Set("Content-Encoding", "gzip")
	w.Header().Set("Content-Type", mime)
	gz := gzip.NewWriter(w)
	defer gz.Close()

	_, error := os.Stat(File)
	exist := !errors.Is(error, os.ErrNotExist)

	if !exist {
		send(path, w, mime)
		return errors.New("file not found! Trying to send uncompressed file")
	}

	// Abre o arquivo HTML
	file, err := os.Open(File) // todo: create a better way to do this
	if err != nil {
		return_err := errors.New("error opening the file")
		//
		conf.Err(w, 500, return_err)
		return return_err
	}
	defer file.Close()
	//file, _, _ := conf.ReadFile(File);

	// Copia o conteúdo do arquivo para o escritor Gzip
	_, err = io.Copy(gz, file)
	if err != nil {
		return_err := errors.New("error copying the content")
		//
		conf.Err(w, 500, return_err)
		return return_err
	}
	return nil
}

func send(path string, w http.ResponseWriter, mime string) {
	// get the file path based on the project path
	file, status, err := conf.ReadFile("../public/" + path);
	if status != 200 {
		conf.Err(w, status, err)
		return
	}

	// Get the file size
	info, err := os.Stat(path)
	if err != nil {
		return
	}

	// Read the file content
	data := make([]byte, info.Size())
	count, err := file.Read(data)
	if err != nil {
		return
	}

	//fmt.Printf("read %d bytes: %q\n", count, data[:count])
	w.Header().Set("Content-Type", mime)
	w.Write([]byte(data[:count]))
}

/*func readJsonFile(path string) ([]byte, error) {
	data, _, _ := conf.ReadFile(path);
	//
	jsonData, err := json.Marshal(data)
	if err != nil {
		fmt.Printf("could not marshal json: %s\n", err)
		return nil, err
	}
	return jsonData, nil
}*/

func Start() {
	//database.DB();
	//fmt.Println(readJsonFile("../public/static/awesome.json"))
	// file handle
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Extraindo o caminho do arquivo da URL
		path := r.URL.Path

		// gemini helped me with this, but I have modifiied it
		// transformar em algo mais parecido com o meus codigos em rust com o equivalente de Some() e None()
		lastIndex := strings.LastIndexByte(path, '.')
		file := ""
		mime := "text/html"
		//
		if lastIndex > 0 && lastIndex < len(path)-1 {
			file = strings.ToLower(path[lastIndex+1:])
		}

		// the most important route
		if path == "/" {
			send("index.html", w, "html")
			return
		}

		if path == "/frontend/wasm_bg.wasm" {
			send("/scripts/frontend/wasm_bg.wasm", w, "application/wasm");
			return
		}

		// verify if the user can access directly the file, remember, the code is public and it can be acessed in the devtools or in my github
		// TODO: create a better way to do this
		// reimplement the static file load without the file extension
		redirect := map[string]File{
			// Todo: get the files e generate the templates automatically
			"png":         	{ Folder: "img", Mime: "image/png" },
			"ico":         	{ Folder: "img", Mime: "image/x-icon" },
			"svg":         	{ Folder: "img/svg", Mime: "image/svg+xml" },
			"woff2":       	{ Folder: "fonts", Mime: "application/font-woff" },
			"webmanifest": 	{ Folder: "static", Mime: "application/manifest+json" },
			"html":        	{ Folder: "static", Mime: "text/html"},
			"js":          	{ Folder: "scripts", Mime: "application/javascript" },
			"wasm": 	   	{ Folder: "scripts/frontend", Mime: "application/wasm" },
			"css":         	{ Folder: "styles", Mime: "text/css" },
			//"": {Folder: "static"},
		}

		if template, ok := redirect[file]; ok {
			file = template.Folder
			mime = template.Mime
		}

		if file != "static" && file != "json" && r.Header.Get("Referer") == "" {
			fmt.Println(file)
			conf.Err(w, 403, errors.New("not allowed"))
			return
		}

		url := file + r.URL.Path
		sendGzip(w, r, mime, url)
	})

	http.HandleFunc("/get_data", func(w http.ResponseWriter, r *http.Request) {
		send("static/awesome.json", w, "application/json")
		// Todo: create a query handler
	})

	http.HandleFunc("/save_data", func(w http.ResponseWriter, r *http.Request) {
		// TODO: implement this
		// get the data from the request
		/*ata := r.FormValue("data")
		fmt.Println(data)
		w.Write([]byte("ok"))*/
		conf.Err(w, 501, errors.New("not implemented"))
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

func isGzipAccepted(r *http.Request) bool {
	encodings := r.Header.Get("Accept-Encoding")
	return encodings != "" && strings.Contains(encodings, "gzip")
}