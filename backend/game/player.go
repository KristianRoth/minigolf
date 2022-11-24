package game

import (
	"backend/calc"
	"backend/models"

	"github.com/gorilla/websocket"
)

var Id int64 = 0

type Player struct {
	PlayerConn
	id         int64
	name       string
	prev_ball  Ball
	ball       Ball
	shot_count int64
	is_turn    bool
	is_ready   bool
}

func NewPlayer(name string, ws websocket.Conn, playerChannel *chan playerEvent) Player {
	start := calc.NewVec(0, 0)
	vel := calc.NewVec(0, 0)
	Id++
	ball := newBall(start, vel)
	return Player{
		name:      name,
		id:        Id,
		prev_ball: ball.Clone(),
		ball:      ball,
		is_turn:   false,
		PlayerConn: PlayerConn{
			playerEventsIn:  playerChannel,
			PlayerEventsOut: make(chan interface{}),
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
		ShotCount: int64(player.shot_count),
		Name:      player.name,
		Id:        player.id,
	}
}
