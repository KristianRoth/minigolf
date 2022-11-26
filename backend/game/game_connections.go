package game

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/gorilla/websocket"
)

type GameConn struct {
	broadcast     *chan interface{}
	playerChannel *chan playerEvent
}

type PlayerConn struct {
	playerEventsIn  *chan playerEvent
	playerEventsOut *chan interface{}
	ws              *websocket.Conn
}

type playerEvent struct {
	player  *Player
	message []byte
}

func (p *Player) run() {
	p.isConnected = true
	go func() {
		for p.isConnected {
			_, message, err := p.ws.ReadMessage()
			if err != nil {
				//TODO: something went wrong with player disconnect him
				log.Println("Player read json failed", err)
				p.isConnected = false
				break
			}
			*p.playerEventsIn <- playerEvent{p, message}
		}
	}()
	go func() {
		for p.isConnected {
			err := p.ws.WriteJSON(<-*p.playerEventsOut)
			if err != nil {
				log.Println("Player write to failed", err)
				p.isConnected = false
				break
			}
		}
	}()
}

func (g *Game) startCommunications() {
	go func() {
		for {
			select {
			case message := <-*g.broadcast:
				for _, p := range g.players {
					*p.playerEventsOut <- message
				}
			case playerEvent := <-*g.playerChannel:
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
				case "IS_READY":
					var isReadyEvent isReadyEvent
					err := json.Unmarshal(message, &isReadyEvent)
					if err != nil {
						fmt.Println(fmt.Errorf("unable to parse isready-event, %v, %s", err, message))
						break
					}
					go g.handleIsReadyEvent(player, isReadyEvent)
				}
			}
		}
	}()
}
