package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"io"
	"net/http"
	"os"
	"strings"
	// my packages
	"compress/gzip"
	"webchat/conf"
	//"webchat/database"
	"github.com/google/uuid"
)

type File struct {
	Folder string
	Mime string
}

const PORT = "8080"

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

func running_status(w http.ResponseWriter, r *http.Request) {
	status := map[string]string{
		"port": PORT,
		"status": "running",
		"ip": GetIP(r),
	}
	jsonStatus, err := json.Marshal(status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	//
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonStatus)
}

func expect(w http.ResponseWriter, val string, origin map[string]interface{}) bool {
	if origin[val] != nil {
		return true
	}
	//http.Error(w, fmt.Sprintf("Missing arg: %s!", val), http.StatusNotAcceptable)
	status := map[string]string{
		"status": "invalid arguments!",
	}
	jsonStatus, err := json.Marshal(status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return false
	}
	//
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonStatus)
	//
	return false
}

func chat_handler(w http.ResponseWriter, r *http.Request) {
	querry := r.URL.Query()
	chat := make(map[string]interface{})
	//
	for key, values := range querry {
		chat[key] = values[0]
	}

	if !expect(w, "name", chat) || !expect(w, "desc", chat) {
		return
	}

	chat["id"] = uuid.New().String() // Todo: check in the DB if the value already exists

	// Convertendo para JSON
	jsonData, err := json.Marshal(chat)
	if err != nil {
		http.Error(w, "Erro ao converter para JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func Start() {
	http.HandleFunc("/", default_handler)

	http.HandleFunc("/is_running", running_status)

	http.HandleFunc("/test", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "<h1>%s</h1><div>%s</div>", "59", "bruh")
	})

	http.HandleFunc("/new_chat", chat_handler)

	fmt.Println("The server has started successfully in http://localhost:" + PORT)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", PORT), nil); err != nil {
		log.Fatal(err)
	}
}

// GetIP gets a requests IP address by reading off the forwarded-for
// header (for proxies) and falls back to use the remote address.
func GetIP(r *http.Request) string {
	forwarded := r.Header.Get("X-FORWARDED-FOR")
	if forwarded != "" {
		return forwarded
	}
	return r.RemoteAddr
}