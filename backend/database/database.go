package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func NewDatabaseConnection() *mongo.Client {
	protocol := os.Getenv("MINIGOLF_DB_PROTOCOL")
	user := os.Getenv("MINIGOLF_DB_USER")
	password := os.Getenv("MINIGOLF_DB_PASSWORD")
	host := os.Getenv("MINIGOLF_DB_HOST")
	url := fmt.Sprintf("%s://%s:%s@%s/?retryWrites=true&w=majority", protocol, user, password, host)

	fmt.Printf("MONGO_URL: %s \n", url)

	serverAPIOptions := options.ServerAPI(options.ServerAPIVersion1)

	clientOptions := options.Client().
		ApplyURI(url).
		SetServerAPIOptions(serverAPIOptions)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}
	return client
}

var Client *mongo.Client = NewDatabaseConnection()
