package config

import (
	"fmt"
	"html/template"
	"net/http"
)

var mime = map[string]string {
	"js": "text/javascript",
	"wasm": "application/wasm",
	"static": "text/html",
	"scripts": "application/javascript",
}

func Mime(file_type string) string {
	return mime[file_type]
}

// err handler

func err(err int) *template.Template {
	return template.Must(template.ParseFiles("src/templates/err/" + fmt.Sprintf("%d", err) + ".html"))
}

var errTemplates = map[int]*template.Template {
	// Todo: get the files e generate the templates automatically
	401: err(401), // Unauthorized
	403: err(403), // Forbidden
	404: err(404), // Not Found
	418: err(418), // I'm a teapot
	500: err(500), // Internal Server Error
	501: err(501), // Not Implemented
	508: err(508), // Loop Detected
}

// exported function:
func Err(w http.ResponseWriter, err int) {
	// retornar a função para poder eviter usar 'errHandler(w, 500)' e no lugar usar 'errHandler(500)', sem a necessidade do 'http.ResponseWriter'
	if template, ok := errTemplates[err]; ok {
		w.WriteHeader(err)
		template.Execute(w, nil)
		return
	}
	// Handle unexpected errors here
	err_msg := "Internal Server Error, this is an err inside the err handler, the original err was: " + fmt.Sprintf("%b", err)
	http.Error(w, err_msg, 500)
}