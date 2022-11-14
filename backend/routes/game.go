package routes

import (
	"backend/communications"
	"backend/database"
	"backend/models"
	"context"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func GameRoutes(router *gin.Engine, gameH *communications.GameHandler) {
	router.GET("/api/game-maps", func(c *gin.Context) {
		result, err := database.GetGameMaps()

		if err != nil {
			log.Println(err)
			c.JSON(500, gin.H{"error": "Something went wrong"})
			return
		}

		c.JSON(200, result)
	})

	router.GET("/api/game-maps/:id", func(c *gin.Context) {
		id := c.Param("id")

		result, err := database.GetGameMap(id)
		if err != nil {
			log.Println(err)
			if err == mongo.ErrNoDocuments {
				c.JSON(404, gin.H{"error": "Map not found"})
			} else {
				c.JSON(500, gin.H{"error": "Something went wrong"})
			}
			return
		}
		c.JSON(200, result)
	})

	router.GET("/api/init-game/:mapId", func(c *gin.Context) {
		map_id := c.Param("mapId")
		result, err := database.GetGameMap(map_id)

		if err != nil {
			log.Println(err)
			if err == mongo.ErrNoDocuments {
				c.JSON(404, gin.H{"error": "Map not found"})
			} else {
				c.JSON(500, gin.H{"error": "Something went wrong"})
			}
			return
		}

		g_id := gameH.GameFromMapDto(result)
		c.JSON(200, gin.H{"gameId": g_id})
	})

	router.POST("/api/init-game", func(c *gin.Context) {
		var game_dto models.GameMapDto
		if err := c.BindJSON(&game_dto); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"data": "Invalid gamemap"})
			return
		}
		game_map_hash := game_dto.Hash()
		game_dto.Id = game_map_hash

		createdId, err := database.CreateGameMap(game_dto)

		if err != nil {
			log.Println(err)
		}

		if createdId == nil {
			log.Println("Duplicate map. Skipped insert")
		} else {
			log.Printf("Inserted map %s\n", createdId)
		}

		g_id := gameH.GameFromMapDto(game_dto)
		c.JSON(200, gin.H{"gameId": g_id})
	})

	router.GET("/api/hello/:name", func(c *gin.Context) {
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

		res, err := collection.InsertOne(context.Background(), bson.M{"name": name})
		if err != nil {
			log.Fatal(err)
		}
		log.Println(res.InsertedID)
		log.Println("Insert succesful")

		cur, err := collection.Find(context.Background(), bson.M{"name": bson.M{"$exists": true}})
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

	router.GET("/api/unsafe-drop-db", func(c *gin.Context) {
		database.Client.Database("minigolf").Collection("gameMap").Drop(context.Background())
		database.Client.Database("minigolf").Collection("helloWorld").Drop(context.Background())
		c.JSON(200, gin.H{"success": true})
	})
}
