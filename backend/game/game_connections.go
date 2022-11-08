package game

import (
	"backend/models"
	"encoding/json"
	"fmt"

	"github.com/gorilla/websocket"
)

type GameConn struct {
	broadcast     chan interface{}
	playerChannel chan playerEvent
}

type PlayerConn struct {
	playerEvents *chan playerEvent
	ws           websocket.Conn
}

type Event struct {
	Type string `json:"type"`
}

type initEvent struct {
	Type     string            `json:"type"`
	PlayerId int32             `json:"playerId"`
	GameMap  models.GameMapDto `json:"gameMap"`
}

type updateEvent struct {
	Type         string        `json:"type"`
	PlayerStates []playerState `json:"playerStates"`
}

type shotEvent struct {
	Type string  `json:"type"`
	Id   int64   `json:"id"`
	X    float64 `json:"x"`
	Y    float64 `json:"y"`
}

type playerEvent struct {
	player  *Player
	message []byte
}

func (p Player) run() {
	for {
		_, message, err := p.ws.ReadMessage()
		if err != nil {
			break
		}
		*p.playerEvents <- playerEvent{&p, message}
	}
}

func (g Game) sendAllPlayers(s string) {
	fmt.Println("Sending message:", s)
	go func() { g.broadcast <- s }()
}

func (g Game) sendInitEvent() {
	g.broadcast <- initEvent{
		Type:     "INIT",
		PlayerId: 1,
		GameMap:  GameToDto(g.game_map),
	}
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
		case playerEvent := <-g.playerChannel:
			player, message := playerEvent.player, playerEvent.message
			fmt.Println("Received message:", string(message))
			var event Event
			err := json.Unmarshal(message, &event)
			if err != nil {
				fmt.Println(fmt.Errorf("Unknow message from player, %v, %s", err, message))
				break
			}
			switch event.Type {
			case "SHOT":
				var shotEvent shotEvent
				err := json.Unmarshal(message, &shotEvent)
				if err != nil {
					fmt.Println(fmt.Errorf("Unable to parse shot event, %v, %s", err, message))
					break
				}
				g.doShotEvent(player, shotEvent)
			}
		}
	}
}
