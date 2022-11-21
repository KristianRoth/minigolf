package routes

import (
	"backend/communications"
	"backend/database"
	"backend/game"
	"backend/models"
	"backend/util"
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
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

	router.POST("/api/game-maps", func(c *gin.Context) {
		var game_dto models.GameMapDto
		if err := c.BindJSON(&game_dto); err != nil {
			fmt.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"data": "Invalid gamemap"})
			return
		}
		game_map_hash := game_dto.Hash()
		game_dto.Id = game_map_hash

		auth_ok := util.ValidateSaveMapJWT(c.GetHeader("Authorization"), game_map_hash)

		if !auth_ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		createdId, err := database.CreateGameMap(game_dto)
		if err != nil {
			log.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		}

		if createdId == nil {
			log.Println("Duplicate map. Skipped insert")
		} else {
			log.Printf("Inserted map %s\n", createdId)
		}

		c.JSON(200, gin.H{"gameMap": game_dto.Id})
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

		g_id := gameH.GameFromMapDto(result, false)
		c.JSON(200, gin.H{"gameId": g_id})
	})

	router.POST("/api/init-game", func(c *gin.Context) {
		var game_dto models.GameMapDto
		if err := c.BindJSON(&game_dto); err != nil {
			fmt.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"data": "Invalid gamemap"})
			return
		}
		game_map_hash := game_dto.Hash()
		game_dto.Id = game_map_hash

		g_id := gameH.GameFromMapDto(game_dto, true)
		c.JSON(200, gin.H{"gameId": g_id})
	})

	router.GET("/api/game-options", func(c *gin.Context) {
		c.JSON(200, game.NewGameOptions())
	})

	router.GET("/api/unsafe-drop-db", func(c *gin.Context) {
		database.Client.Database("minigolf").Collection("gameMap").Drop(context.Background())
		database.Client.Database("minigolf").Collection("helloWorld").Drop(context.Background())
		c.JSON(200, gin.H{"success": true})
	})
}
