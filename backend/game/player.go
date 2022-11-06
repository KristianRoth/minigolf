package game

import (
	"backend/calc"

	"github.com/gorilla/websocket"
)

type Player struct {
	name       string
	ball       Ball
	shot_count int
	ws         websocket.Conn
}

func NewPlayer(name string, ws websocket.Conn) Player {
	start := calc.NewVec(0.0, 0.0)
	vel := calc.NewVec(1.0, 1.0)
	return Player{
		name: name,
		ball: newBall(start, vel),
		ws:   ws,
	}
}
