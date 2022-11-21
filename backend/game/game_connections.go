package game

import (
	"backend/models"
	"backend/util"
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
	IsDemo   bool              `json:"isDemo"`
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

type saveDemoMapEvent struct {
	Type string `json:"type"` // "SAVE_DEMO_MAP"
	Jwt  string `json:"jwt"`
}

type errorEvent struct {
	Type  string `json:"type"` // "ERROR"
	Value string `json:"value"`
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
		IsDemo:   g.is_demo,
	}
}

func (g Game) sendTurnBeginEvent(p Player) {
	p.PlayerEventsOut <- turnBeginEvent{
		Type:     "TURN_BEGIN",
		PlayerId: p.id,
	}
}

func (g Game) sendEffectEvent(p Player, effect SpecialEffect) {
	g.broadcast <- effectEvent{
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

func (g Game) sendError(p Player, value string) {
	p.PlayerEventsOut <- errorEvent{
		Type:  "ERROR",
		Value: value,
	}
}

func (g Game) sendSaveDemoMapEvent(p Player) {
	hash := GameMapToDto(g.game_map).Hash()
	jwt, jwt_err := util.GenerateSaveMapJWT(hash)

	if jwt_err != nil {
		fmt.Println(jwt_err)
		g.sendError(p, "Something went wrong")
		return
	}

	p.PlayerEventsOut <- saveDemoMapEvent{
		Type: "SAVE_DEMO_MAP",
		Jwt:  jwt,
	}
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
				g.doShot(player, shotEvent)
			}
		}
	}
}
