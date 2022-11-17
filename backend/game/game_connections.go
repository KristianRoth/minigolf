package game

import (
	"backend/models"
	"encoding/json"
	"fmt"
	"log"

	"github.com/gorilla/websocket"
)

type GameConn struct {
	broadcast     chan interface{}
	playerChannel chan playerEvent
}

type PlayerConn struct {
	playerEventsIn  *chan playerEvent
	PlayerEventsOut chan interface{}
	ws              websocket.Conn
}

type event struct {
	Type string `json:"type"`
}

type initEvent struct {
	Type     string            `json:"type"`
	PlayerId int64             `json:"playerId"`
	GameMap  models.GameMapDto `json:"gameMap"`
}

type turnBeginEvent struct {
	Type     string `json:"type"`
	PlayerId int64  `json:"playerId"`
}

type updateEvent struct {
	Type         string             `json:"type"`
	PlayerStates []models.PlayerDto `json:"playerStates"`
}

type effectEvent struct {
	Type     string        `json:"type"` // Effect
	Value    SpecialEffect `json:"value"`
	PlayerId int64         `json:"playerId"`
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

func (p *Player) run() {
	go func() {
		for {
			_, message, err := p.ws.ReadMessage()
			if err != nil {
				//TODO: something went wrong with player disconnect him
				log.Println("Player read json failed", err)
				break
			}
			*p.playerEventsIn <- playerEvent{p, message}
		}
	}()
	go func() {
		for {
			err := p.ws.WriteJSON(<-p.PlayerEventsOut)
			if err != nil {
				log.Println("Player write to failed", err)
				break
			}
		}
	}()
}

func (g Game) sendInitEvent(p Player) {
	p.PlayerEventsOut <- initEvent{
		Type:     "INIT",
		PlayerId: p.id,
		GameMap:  GameMapToDto(g.game_map),
	}
}

func (g Game) sendTurnBeginEvent(p Player) {
	p.PlayerEventsOut <- turnBeginEvent{
		Type:     "TURN_BEGIN",
		PlayerId: p.id,
	}
}

func (g Game) sendEffectEvent(p Player, effect SpecialEffect) {
	p.PlayerEventsOut <- effectEvent{
		Type:     "EFFECT",
		PlayerId: p.id,
		Value:    effect,
	}
}

func (g Game) sendUpdateEvent() {
	var playerStates []models.PlayerDto
	for _, player := range g.players {
		playerStates = append(playerStates, PlayerToDto(*player))
	}
	g.broadcast <- updateEvent{
		Type:         "UPDATE",
		PlayerStates: playerStates,
	}
}

func (g *Game) handleShotEvent(p *Player, event shotEvent) {
	p.ball.Vel.X = event.X / 10
	p.ball.Vel.Y = event.Y / 10
	p.shot_count += 1
	p.is_turn = false
}

func (g *Game) run() {

	for {
		select {
		case message := <-g.broadcast:
			for _, p := range g.players {
				p.PlayerEventsOut <- message
			}
		case playerEvent := <-g.playerChannel:
			player, message := playerEvent.player, playerEvent.message
			fmt.Println("Received message:", string(message))
			var event event
			err := json.Unmarshal(message, &event)
			if err != nil {
				fmt.Println(fmt.Errorf("unknow message from player, %v, %s", err, message))
				break
			}
			switch event.Type {
			case "SHOT":
				var shotEvent shotEvent
				err := json.Unmarshal(message, &shotEvent)
				if err != nil {
					fmt.Println(fmt.Errorf("unable to parse shot event, %v, %s", err, message))
					break
				}
				g.handleShotEvent(player, shotEvent)
			}
		}
	}
}
