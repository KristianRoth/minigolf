package util

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

var jwt_secret = []byte(os.Getenv("MINIGOLF_JWT_SECRET"))

type SaveMapClaims struct {
	MapHash string `json:"mapHash"`
	jwt.RegisteredClaims
}

// https://www.sohamkamani.com/golang/jwt-authentication/
// -
func GenerateSaveMapJWT(map_hash string) (string, error) {
	expiry := time.Now().Add(5 * time.Minute)
	claims := &SaveMapClaims{
		MapHash: map_hash,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiry),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwt_secret)
}

func ValidateSaveMapJWT(auth_header string, map_hash string) bool {
	jwt_string := strings.TrimSpace(strings.Split(auth_header, "Bearer")[1])

	claims := &SaveMapClaims{}
	tkn, err := jwt.ParseWithClaims(jwt_string, claims, func(token *jwt.Token) (interface{}, error) {
		return jwt_secret, nil
	})
	if err != nil {
		fmt.Println(err)
		return false
	}
	if !tkn.Valid {
		fmt.Println("token invalid")
		return false
	}
	if claims.MapHash != map_hash {
		fmt.Println("maphash mismatch")
		return false
	}
	return true
}
