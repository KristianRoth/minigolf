package routes

import (
	"backend/communications"
	"backend/game"
	"backend/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
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
}
