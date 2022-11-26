package game

import (
	"backend/calc"
	"backend/models"

	"github.com/gorilla/websocket"
)

var Id int64 = 0

type Player struct {
	*PlayerConn
	id          int64
	name        string
	prevBall    Ball
	ball        Ball
	shotCount   int64
	isTurn      bool
	isReady     bool
	isConnected bool
}

func NewPlayer(name string, ws *websocket.Conn, playerChannel *chan playerEvent) *Player {
	start := calc.NewVec(0, 0)
	vel := calc.NewVec(0, 0)
	Id++
	ball := newBall(start, vel)

	eventsOut := make(chan interface{})
	return &Player{
		name:     name,
		id:       Id,
		prevBall: ball.Clone(),
		ball:     ball,
		isTurn:   false,
		PlayerConn: &PlayerConn{
			playerEventsIn:  playerChannel,
			playerEventsOut: &eventsOut,
			ws:              ws,
		},
	}
}

func PlayerToDto(player Player) models.PlayerDto {
	return models.PlayerDto{
		X:         player.ball.Pos.X,
		Y:         player.ball.Pos.Y,
		Dx:        player.ball.Vel.X,
		Dy:        player.ball.Vel.Y,
		ShotCount: int64(player.shotCount),
		Name:      player.name,
		Id:        player.id,
	}
}
