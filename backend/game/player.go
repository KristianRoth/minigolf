package game

import (
	"backend/calc"

	"github.com/gorilla/websocket"
)

type Player struct {
	name string
	ball Ball
	ws   websocket.Conn
}

func NewPlayer(name string, ws websocket.Conn) Player {
	start := calc.NewVec(0.0, 0.0)
	vel := calc.NewVec(1.0, 1.0)
	return Player{
		name: name,
		ball: NewBall(start, vel),
		ws:   ws,
	}
}

func (p *Player) Update() {
	p.ball = p.ball.Move(p.ball.Vel.Length())
}
