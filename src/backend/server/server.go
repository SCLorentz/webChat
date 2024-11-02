package server

import (
	"errors"
	"fmt"
	"log"
	"io"
	"net/http"
	"os"
	"strings"
	"compress/gzip"
	// my packages
	"webchat/conf"
	"webchat/chat"
	//"webchat/database"
)

type File struct {
	Folder string
	Mime string
}

func isGzipAccepted(r *http.Request) bool {
	encodings := r.Header.Get("Accept-Encoding")
	return encodings != "" && strings.Contains(encodings, "gzip")
}

func sendGzip(w http.ResponseWriter, r *http.Request, mime string, path string) error {
	File := "../frontend/" + path
	// Verifica se o cliente aceita compressão Gzip
	if !isGzipAccepted(r) {
		//http.Error(w, "Not Acceptable", http.StatusNotAcceptable) // err 406
		send(path, w, mime)
		return errors.New("not acceptable! Sending uncompressed file...")
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
		return errors.New("file not found! Trying to send uncompressed file...")
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
		return_err := errors.New("error while copying the content!")
		//
		conf.Err(w, 500, return_err)
		return return_err
	}
	return nil
}

func send(path string, w http.ResponseWriter, mime string) {
	// get the file path based on the project path
	file, status, err := conf.ReadFile("../frontend/" + path);
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
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	//fmt.Printf("read %d bytes: %q\n", count, data[:count])
	w.Header().Set("Content-Type", mime)
	w.Write([]byte(data[:count]))
}

func default_handler(w http.ResponseWriter, r *http.Request) {
	//path := r.URL.Path
	sendGzip(w, r, "text/html", "static/pages/index.html")
}

func Start() {
	http.HandleFunc("/", default_handler)

	http.HandleFunc("/is_running", conf.Status)

	http.HandleFunc("/new_chat", chat.Handler)

	// http.HandleFunc("/new_message", messages.Handler) <-- All of this should be criptografed

	/* this is useful:
	http.HandleFunc("/test", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "<h1>%s</h1><div>%s</div>", "59", "bruh")
	})*/

	fmt.Println("The server has started successfully in http://localhost:" + conf.PORT)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", conf.PORT), nil); err != nil {
		log.Fatal(err)
	}
}