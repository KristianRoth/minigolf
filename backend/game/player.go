package game

import (
	"backend/calc"
	"backend/models"

	"github.com/gorilla/websocket"
)

type Player struct {
	PlayerConn
	name       string
	ball       Ball
	shot_count int64
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

func PlayerToDto(player Player) models.PlayerDto {
	return models.PlayerDto{
		X:         player.ball.Pos.X,
		Y:         player.ball.Pos.Y,
		Dx:        player.ball.Vel.X,
		Dy:        player.ball.Vel.Y,
		ShotCount: int64(player.shot_count),
		Name:      player.name,
	}
}
