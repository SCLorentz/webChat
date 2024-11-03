package db

import (
	"database/sql"
	"fmt"
	"net/http"
	"encoding/json"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	DB *sql.DB
}

var dbInstance *Database

func Connect(path string) {
	var err error
	dbInstance = &Database{}
	dbInstance.DB, err = sql.Open("sqlite3", fmt.Sprintf("file:%s?cache=shared", path))
	//
	if err != nil {
		log.Fatalf("Error connecting to the database: %v", err)
	}
}

func GetDB() *sql.DB {
	if dbInstance == nil || dbInstance.DB == nil {
		return nil
	}
	return dbInstance.DB
}

func (db *Database) Close() error {
	return db.DB.Close()
}

func GetDBHandler(w http.ResponseWriter, r *http.Request) {
	db := GetDB()
	if db == nil {
		http.Error(w, "Erro ao obter o banco de dados", http.StatusInternalServerError)
		return
	}

	jsonData, err := json.Marshal(db)
	if err != nil {
		http.Error(w, "Erro ao converter para JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}