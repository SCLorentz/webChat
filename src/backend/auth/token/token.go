package token

import (
    "fmt"
    "time"
    "github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
)

func GenerateToken(userID int) (string, error) {
    claims := jwt.StandardClaims{
        ExpiresAt: time.Now().Add(time.Hour * 24).Unix(),
        Issuer:    "ch6",
        Subject:   fmt.Sprintf("%d", userID),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

    ss, err := token.SignedString([]byte(uuid.New().String()))
    if err != nil {
        return "", err
    }

    return ss, nil
}

/*func ValidateToken(tokenString string) (int, error) {
    
}*/