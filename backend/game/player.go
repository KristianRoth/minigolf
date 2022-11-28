package game

import (
	"backend/calc"
	"backend/models"

	"github.com/gorilla/websocket"
)

type PlayerStatus int64

const (
	PlayerIsWaiting PlayerStatus = iota // Is not ready in lobby
	PlayerIsReady                       // Is ready in lobby
	PlayerHasTurn                       // Is turn
	PlayerIsMoving                      // Is waiting for TURN_BEGIN
	PlayerIsInHole                      // Has holed and is waiting for others
)

var Id int64 = 0

type Player struct {
	*PlayerConn
	id        int64
	name      string
	prevBall  Ball
	ball      Ball
	scores    []int64
	status    PlayerStatus
	shotCount int64
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
		status:   PlayerIsWaiting,
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
