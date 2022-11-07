package game

import (
	"backend/models"
	"fmt"

	"github.com/gorilla/websocket"
)

type GameConn struct {
	broadcast     chan interface{}
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

type initEvent struct {
	Type     string            `json:"type"`
	PlayerId int32             `json:"playerId"`
	GameMap  models.GameMapDto `json:"gameMap"`
}

func (g Game) sendInitEvent() {
	g.broadcast <- initEvent{
		Type:     "INIT",
		PlayerId: 1,
		GameMap:  GameToDto(g.game_map),
	}
}

type updateEvent struct {
	Type         string        `json:"type"`
	PlayerStates []playerState `json:"playerStates"`
}

type playerState struct {
	X         float64 `json:"x"`
	Y         float64 `json:"y"`
	Dx        float64 `json:"dx"`
	Dy        float64 `json:"dy"`
	Id        int64   `json:"id"`
	Name      string  `json:"name"`
	ShotCount int64   `json:"shotCount"`
}

func (g Game) sendUpdateEvent() {
	g.broadcast <- updateEvent{
		Type: "UPDATE",
		PlayerStates: []playerState{
			{
				X:         g.players["Nimi"].ball.Pos.X,
				Y:         g.players["Nimi"].ball.Pos.Y,
				Dx:        1,
				Dy:        1,
				Id:        1,
				Name:      "Nimi",
				ShotCount: 1,
			},
		},
	}
}

func (g Game) run() {

	for {
		select {
		case message := <-g.broadcast:
			for name, p := range g.players {
				fmt.Println("Sending to name", name)
				p.ws.WriteJSON(message)
			}
		case message := <-g.playerChannel:
			fmt.Println("Received message:", message)
		}
	}
}
