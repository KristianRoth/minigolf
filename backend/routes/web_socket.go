package routes

import (
	"backend/communications"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true }, //TODO: this is wrong
}

func WebSocket(router *gin.Engine, gameH *communications.GameHandler) {
	router.GET("/game/:gameId", func(c *gin.Context) {
		//upgrade get request to websocket protocol
		gameId := c.Param("gameId")
		name := c.Query("name")
		fmt.Println("Adding player:", name, "to game:", gameId)
		ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		<-time.After(time.Second)
		if err != nil {
			fmt.Println(err)
			return
		}
		gameH.NewConnection(gameId, name, *ws)
	})
}
