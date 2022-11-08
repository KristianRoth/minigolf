package game

import (
	"backend/calc"

	"github.com/gorilla/websocket"
)

type Player struct {
	PlayerConn
	name       string
	ball       Ball
	shot_count int
}

func NewPlayer(name string, ws websocket.Conn, playerChannel *chan playerEvent) Player {
	start := calc.NewVec(200.0, 200.0)
	vel := calc.NewVec(1.0, 1.0)
	return Player{
		name: name,
		ball: newBall(start, vel),
		PlayerConn: PlayerConn{
			playerEvents: playerChannel,
			ws:           ws,
		},
	}
}
