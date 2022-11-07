package game

import (
	"fmt"

	"github.com/gorilla/websocket"
)

type GameConn struct {
	broadcast     chan string
	playerChannel chan string
}

type PlayerConn struct {
	playerEvents *chan string
	ws           websocket.Conn
}

func (p Player) run() {
	for {
		_, message, err := p.ws.ReadMessage()
		if err != nil {
			break
		}
		*p.playerEvents <- string(message)
	}
}

func (p Player) SendPlayerEvent() {
}

func (p Player) leave() {

}

func (g Game) sendAllPlayers(s string) {
	fmt.Println("Sending message:", s)
	go func() { g.broadcast <- s }()
}

func (g Game) run() {

	for {
		select {
		case message := <-g.broadcast:
			fmt.Println("Broadcasting:", message)
			for name, p := range g.players {
				fmt.Println("Sending to name", name)
				p.ws.WriteJSON(message)
			}
		case message := <-g.playerChannel:
			fmt.Println("Received message:", message)
		}
	}
}
