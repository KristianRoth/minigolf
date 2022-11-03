package game

import "github.com/gorilla/websocket"

type Player struct {
	name string
	ball Ball
	ws   websocket.Conn
}

func NewPlayer(name string, ws websocket.Conn) Player {
	return Player{
		name: name,
		ball: NewBall(),
		ws:   ws,
	}
}

func (p Player) Update() {
	p.ball.x += p.ball.vx
	p.ball.y += p.ball.vy
}
