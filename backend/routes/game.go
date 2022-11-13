package routes

import (
	"backend/communications"
	"backend/database"
	"backend/models"
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func GameRoutes(router *gin.Engine, gameH *communications.GameHandler) {
	router.GET("/api", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"data": "Hello World!",
		})
	})

	router.GET("/api/:name", func(c *gin.Context) {
		name := c.Param("name")
		c.JSON(200, gin.H{
			"data": fmt.Sprintf("Hello %s!", name),
		})
	})

	router.GET("/api/game-maps", func(c *gin.Context) {
		collection := database.Client.Database("minigolf").Collection("gameMap")

		cur, err := collection.Find(context.Background(), bson.D{{"tiles", bson.D{{"$exists", true}}}})
		if err != nil {
			log.Fatal(err)
		}
		var result []models.GameMapDto
		cur.All(context.Background(), &result)
		c.JSON(200, result)
	})

	router.GET("/api/game-maps/:id", func(c *gin.Context) {
		id := c.Param("id")
		collection := database.Client.Database("minigolf").Collection("gameMap")

		cur, err := collection.Find(context.Background(), bson.D{{"id", id}})
		if err != nil {
			log.Fatal(err)
		}
		var result []models.GameMapDto
		cur.All(context.Background(), &result)
		c.JSON(200, result)
	})

	router.POST("/game", func(c *gin.Context) {
		var game_dto models.GameMapDto
		if err := c.BindJSON(&game_dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"data": "Invalid gamemap"})
			return
		}
		game_map_hash := game_dto.Hash()
		game_dto.Id = game_map_hash

		collection := database.Client.Database("minigolf").Collection("gameMap")
		res, err := collection.InsertOne(context.Background(), game_dto)
		if err != nil {
			log.Println(err)
		}
		log.Printf("Inserted game %s\n", res.InsertedID)

		g_id := gameH.GameFromMapDto(game_dto)
		c.JSON(200, gin.H{"gameId": g_id})
	})

	router.GET("/db/hello/:name", func(c *gin.Context) {
		log.Println("Doing db test")
		name := c.Param("name")
		insert := struct {
			name string
		}{
			name: name,
		}
		db := database.Client
		log.Println("Got new Database", insert)

		collection := db.Database("minigolf").Collection("helloWorld")
		log.Println("Got new collection")

		res, err := collection.InsertOne(context.Background(), bson.D{{"name", name}})
		if err != nil {
			log.Fatal(err)
		}
		log.Println(res.InsertedID)
		log.Println("Insert succesful")

		cur, err := collection.Find(context.Background(), bson.D{{"name", bson.D{{"$exists", true}}}})
		if err != nil {
			log.Fatal(err)
		}
		log.Println("Got cursor")
		var result []bson.D

		cur.All(context.Background(), &result)
		log.Println("result", result)
		log.Println("Got data")

		c.JSON(200, result)
	})
}
