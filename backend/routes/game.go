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
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/mongo"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true }, //TODO: this is wrong
}

func GameRoutes(router *gin.Engine, gameH *communications.GameHandler) {
	router.GET("/ws/game/:gameId", func(c *gin.Context) {
		//upgrade get request to websocket protocol
		gameId := c.Param("gameId")
		name := c.Query("name")
		if !gameH.GameExists(gameId) {
			return
		}

		playerId, authOk := util.ValidatePlayerJWT(c.Query("token"), gameId)
		if !gameH.GameJoinable(gameId) && !authOk {
			return
		}

		ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			fmt.Println(err)
			return
		}

		if authOk {
			fmt.Println("Reconnecting player:", playerId, "to game:", gameId)
			gameH.RenewConnection(gameId, playerId, ws)
		} else {
			fmt.Println("Adding player:", name, "to game:", gameId)
			gameH.NewConnection(gameId, name, ws)
		}
	})

	router.GET("/api/game/:gameId", func(c *gin.Context) {
		gameId := c.Param("gameId")

		if !gameH.GameExists(gameId) {
			c.String(404, "Not found")
			return
		}

		// Game exists and is joinable.
		if gameH.GameJoinable(gameId) {
			c.String(200, "OK")
			return
		}

		// Player can reconnect even if game is not joinable.
		jwtString := util.ParseBearerToken(c)
		_, authOk := util.ValidatePlayerJWT(jwtString, gameId)
		if authOk {
			c.String(200, "OK")
			return
		}

		c.String(403, "Unauthorized")
	})

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
		var gameDto models.GameMapDto
		if err := c.BindJSON(&gameDto); err != nil {
			fmt.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"data": "Invalid gamemap"})
			return
		}
		gameMapHash := gameDto.Hash()
		gameDto.Id = gameMapHash

		authOk := util.ValidateSaveMapJWT(c.GetHeader("Authorization"), gameMapHash)

		if !authOk {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		createdId, err := database.CreateGameMap(gameDto)
		if err != nil {
			log.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		}

		if createdId == nil {
			log.Println("Duplicate map. Skipped insert")
		} else {
			log.Printf("Inserted map %s\n", createdId)
		}

		c.JSON(200, gin.H{"gameMap": gameDto.Id})
	})

	router.GET("/api/init-game/:mapId", func(c *gin.Context) {
		mapId := c.Param("mapId")
		result, err := database.GetGameMap(mapId)

		if err != nil {
			log.Println(err)
			if err == mongo.ErrNoDocuments {
				c.JSON(404, gin.H{"error": "Map not found"})
			} else {
				c.JSON(500, gin.H{"error": "Something went wrong"})
			}
			return
		}

		gameId := gameH.GameFromMapDto(result, false)
		c.JSON(200, gin.H{"gameId": gameId})
	})

	router.POST("/api/init-game", func(c *gin.Context) {
		var gameDto models.GameMapDto
		if err := c.BindJSON(&gameDto); err != nil {
			fmt.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"data": "Invalid gamemap"})
			return
		}
		gameMapHash := gameDto.Hash()
		gameDto.Id = gameMapHash

		gameId := gameH.GameFromMapDto(gameDto, true)
		c.JSON(200, gin.H{"gameId": gameId})
	})

	router.POST("/api/create-game", func(c *gin.Context) {
		var options interface{}
		if err := c.BindJSON(&options); err != nil {
			fmt.Println(err)
			c.JSON(http.StatusBadRequest, gin.H{"data": "Invalid options"})
			return
		}

		gameId := gameH.CreateGame()
		c.JSON(200, gin.H{"gameId": gameId})
	})

	router.GET("/api/game-options", func(c *gin.Context) {
		c.JSON(200, gin.H{"gameOptions": game.NewGameOptions(), "lobbyOptions": game.NewLobbyOptions()})
	})

	router.GET("/api/unsafe-drop-db", func(c *gin.Context) {
		database.Client.Database("minigolf").Collection("gameMap").Drop(context.Background())
		database.Client.Database("minigolf").Collection("helloWorld").Drop(context.Background())
		c.JSON(200, gin.H{"success": true})
	})
}
