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
	fmt.Printf("Using db credentials: %s:%s\n", os.Getenv("MINIGOLF_DB_USER"), os.Getenv("MINIGOLF_DB_PASSWORD"))
	serverAPIOptions := options.ServerAPI(options.ServerAPIVersion1)
	clientOptions := options.Client().
		ApplyURI(fmt.Sprintf("mongodb+srv://%s:%s@minigolf-mongo-atlas.nxtkiht.mongodb.net/?retryWrites=true&w=majority", os.Getenv("MINIGOLF_DB_USER"), os.Getenv("MINIGOLF_DB_PASSWORD"))).
		SetServerAPIOptions(serverAPIOptions)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}
	return client
}
