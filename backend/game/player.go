package game

import (
	"backend/calc"
	"backend/models"

	"github.com/gorilla/websocket"
)

type PlayerStatus int64

const (
	IsPlayerWaiting PlayerStatus = iota // Is not ready in lobby
	IsPlayerReady                       // Is ready in lobby
	IsPlayerTurn                        // Is turn
	IsPlayerMoving                      // Is waiting for TURN_BEGIN
	IsPlayerHole                        // Has holed and is waiting for others
)

var Id int64 = 0

type Player struct {
	*PlayerConn
	id          int64
	name        string
	prevBall    Ball
	ball        Ball
	scores      []int64
	status      PlayerStatus
	shotCount   int64
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
		status:   IsPlayerWaiting,
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
