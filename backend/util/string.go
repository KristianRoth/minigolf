package util

import (
	"math/rand"
	"time"
)

var src = rand.NewSource(time.Now().UnixNano())

const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

func RandomString(n int) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[src.Int63()%int64(len(letters))]
	}
	return string(b)
}
