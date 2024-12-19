package server

import (
	"fmt"
	"log"
	"net/http"
	// my packages
	"webchat/conf"
	"webchat/db/chat"
	"webchat/server/common"
	//"webchat/db"
	//"webchat/auth"
	//"webchat/auth/token"
)

func default_handler(w http.ResponseWriter, r *http.Request) {
	common.SendGzip(w, r, "text/html", "static/pages/index.html")
}

func script_handler(w http.ResponseWriter, r *http.Request) {
	common.SendGzip(w, r, "application/javascript", r.URL.Path)
}

func Start() {
	http.HandleFunc("/", default_handler)

	http.HandleFunc("/is_running", conf.Status)

	http.HandleFunc("/new_chat", chat.Handler)

	http.HandleFunc("/scripts/", script_handler)

	//http.HandleFunc("/get_db", database.GetDBHandler)

	// http.HandleFunc("/new_message", messages.Handler) <-- All of this should be criptografed

	/* this is useful:
	http.HandleFunc("/test", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "<h1>%s</h1><div>%s</div>", "59", "bruh")
	})*/

	fmt.Println(fmt.Sprintf("\033[33mThe server has started successfully in http://localhost:%s\033[0m", conf.PORT))
	if err := http.ListenAndServe(fmt.Sprintf(":%s", conf.PORT), nil); err != nil {
		log.Fatal(err)
	}
}

func IsServerRunning() bool {
	_, err := http.Get("http://localhost:" + conf.PORT)
	return err == nil
}