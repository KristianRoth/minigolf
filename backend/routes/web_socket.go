package routes

import (
	"backend/communications"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func WebSocket(router *gin.Engine) {
	fmt.Println("STaring websocket listener")
	gameH := communications.NewGameHandler()
	router.GET("/game/:gameId", func(c *gin.Context) {
		//upgrade get request to websocket protocol
		gameId := c.Param("gameId")
		name := c.Query("name")
		fmt.Println("Adding player:", name, "to game:", gameId)
		ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			fmt.Println(err)
			return
		}
		gameH.NewConnection(gameId, name, *ws)
	})
}
