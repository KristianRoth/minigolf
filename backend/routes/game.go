package routes

import (
	"backend/communications"
	"backend/database"
	"backend/game"
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

	router.GET("/api/game", func(c *gin.Context) {
		game_map := game.NewGameMap()
		dto := game.GameMapToDto(game_map)
		c.JSON(200, dto)
	})

	router.POST("/game", func(c *gin.Context) {
		var game_dto models.GameMapDto
		if err := c.BindJSON(&game_dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"data": "Invalid gamemap"})
		}
		g_id := gameH.GameFromMapDto(game_dto)
		c.JSON(200, gin.H{"gameId": g_id})
	})

	router.GET("/db/hello/:name", func(c *gin.Context) {
		name := c.Param("name")
		db := database.NewDatabaseConnection()
		collection := db.Database("minigolf").Collection("helloWorld")

		_, err := collection.InsertOne(context.Background(), bson.D{{"name", name}})
		if err != nil {
			log.Fatal(err)
		}

		cur, err := collection.Find(context.Background(), bson.D{{"name", bson.D{{"$exists", true}}}})
		if err != nil {
			log.Fatal(err)
		}

		var result []bson.D
		cur.All(context.Background(), &result)

		c.JSON(200, result)
	})
}
