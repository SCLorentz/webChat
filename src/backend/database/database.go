package database

import (
	"fmt"
	"github.com/cvilsmeier/sqinn-go/sqinn"
)

func DB() {
	// Launch sqinn. Terminate at program exit.
	sq := sqinn.MustLaunch(sqinn.Options{})
	defer sq.Terminate()

	// Open database. Close when we're done.
	sq.MustOpen("./users.db")
	defer sq.Close()

	// Create a table.
	sq.MustExecOne("CREATE TABLE users (id INTEGER PRIMARY KEY NOT NULL, name VARCHAR)")

	// Insert users.
	sq.MustExecOne("INSERT INTO users (id, name) VALUES (1, 'Alice')")
	sq.MustExecOne("INSERT INTO users (id, name) VALUES (2, 'Bob')")

	// Query users.
	rows := sq.MustQuery("SELECT id, name FROM users ORDER BY id", nil, []byte{sqinn.ValInt, sqinn.ValText})
	for _, row := range rows {
		fmt.Printf("id=%d, name=%s\n", row.Values[0].AsInt(), row.Values[1].AsString())
	}

	// Output:
	// id=1, name=Alice
	// id=2, name=Bob
}