package chat

import (
	"encoding/json"
	"net/http"
	"fmt"
	//"webchat/database"
	"github.com/google/uuid"
)

type Response map[string]interface{}

func expect(w http.ResponseWriter, val string, origin Response) Response {
	if origin[val] != nil {
		return nil
	}
	
	return map[string]interface{}{
		"status": fmt.Sprintf("missing arg: `%s`!", val),
	}
}

func create_json(w http.ResponseWriter, r *http.Request) Response {
	chat := make(Response)
	//
	for key, values := range r.URL.Query() {
		chat[key] = values[0]
	}

	if err := expect(w, "name", chat); err != nil {
		return err
	}

	if err := expect(w, "desc", chat); err != nil {
		return err
	}

	chat["id"] = uuid.New().String() // Todo: check in the DB if the value already exists
	chat["status"] = "ok"
	//
	return chat
}

/*func auth(w http.ResponseWriter, r *http.Resquest) bool {
	token := r.Header.Get("Authorization")
    if isValidToken(token) {
		return true
    }
	return false
}*/

func Handler(w http.ResponseWriter, r *http.Request) {
	/*if val := auth(w, r); val == false {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}*/
	//
	chat := create_json(w, r)

	jsonData, err := json.Marshal(chat)
	if err != nil {
		http.Error(w, "Erro ao converter para JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}