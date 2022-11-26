package util

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

func ParseBearerToken(c *gin.Context) string {
	return strings.TrimSpace(strings.Split(c.GetHeader("Authorization"), "Bearer")[1])
}

var jwtSecret = []byte(os.Getenv("MINIGOLF_JWT_SECRET"))

type SaveMapClaims struct {
	MapHash string `json:"mapHash"`
	jwt.RegisteredClaims
}

// https://www.sohamkamani.com/golang/jwt-authentication/
// -
func GenerateSaveMapJWT(mapHash string) (string, error) {
	expiry := time.Now().Add(5 * time.Minute)
	claims := &SaveMapClaims{
		MapHash: mapHash,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiry),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func ValidateSaveMapJWT(authHeader string, mapHash string) bool {
	jwtString := strings.TrimSpace(strings.Split(authHeader, "Bearer")[1])

	claims := &SaveMapClaims{}
	tkn, err := jwt.ParseWithClaims(jwtString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	if err != nil {
		fmt.Println(err)
		return false
	}
	if !tkn.Valid {
		fmt.Println("token invalid")
		return false
	}
	if claims.MapHash != mapHash {
		fmt.Println("maphash mismatch")
		return false
	}
	return true
}

type PlayerClaims struct {
	PlayerId int64  `json:"playerId"`
	GameId   string `json:"gameId"`
	jwt.RegisteredClaims
}

func GeneratePlayerJWT(playerId int64, gameId string) (string, error) {
	expiry := time.Now().Add(180 * time.Minute)
	claims := &PlayerClaims{
		PlayerId: playerId,
		GameId:   gameId,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiry),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func ValidatePlayerJWT(jwtString string, gameId string) (int64, bool) {
	if jwtString == "" {
		return -1, false
	}

	claims := &PlayerClaims{}
	tkn, err := jwt.ParseWithClaims(jwtString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	if err != nil {
		fmt.Println(err)
		return -1, false
	}
	if !tkn.Valid {
		fmt.Println("token invalid")
		return -1, false
	}
	if claims.GameId != gameId {
		fmt.Println("invalid game_id")
		return -1, false
	}
	return claims.PlayerId, true
}
