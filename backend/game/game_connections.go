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
	isRunning       bool
}

type playerEvent struct {
	player  *Player
	message []byte
}

func (p *Player) stop() {
	if !p.isRunning {
		return
	}
	p.isRunning = false
	p.ws.Close()
}

func (p *Player) run() {
	p.isRunning = true

	go func() {
		for p.isRunning {
			_, message, err := p.ws.ReadMessage()
			if err != nil {
				//TODO: something went wrong with player disconnect him
				log.Println("Player read json failed", err)
				break
			}
			*p.playerEventsIn <- playerEvent{p, message}
		}
		p.stop()
	}()
	go func() {
		for p.isRunning {
			err := p.ws.WriteJSON(<-*p.playerEventsOut)
			if err != nil {
				log.Println("Player write to failed", err)
				break
			}
		}
		p.stop()
	}()
}

func (g *Game) startCommunications() {
	go func() {
		for g.status != IsStopped {
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

				g.setEventTime()

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
					g.handleIsReadyEvent(player, isReadyEvent)
				}
			}
		}
	}()
}
