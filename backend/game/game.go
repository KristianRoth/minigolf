package game

import (
	"backend/models"
	"fmt"

	"github.com/gorilla/websocket"
)

type GameStatus int64

const (
	IsLobby GameStatus = iota
	IsGame
	IsWaiting
	IsEnd
	IsDemo // If is testing a new map.
)

type Game struct {
	GameConn
	game_id  string
	players  map[int64]*Player
	game_map GameMap
	mesh     colliderMesh
	status   GameStatus
}

func NewGame(game_id string, game_map GameMap, is_demo bool) Game {
	fmt.Println("Making new game:", game_id)
	game := Game{
		game_id:  game_id,
		players:  make(map[int64]*Player),
		game_map: game_map,
		GameConn: GameConn{
			broadcast:     make(chan interface{}),
			playerChannel: make(chan playerEvent),
		},
		mesh: newColliderMesh(game_map),
	}
	game.startCommunications()

	if is_demo {
		game.status = IsDemo
		game.runGame()
	}
	return game
}

func (g *Game) AddPlayer(name string, ws websocket.Conn) {
	player := NewPlayer(name, ws, &g.playerChannel)
	player.ball.Pos = g.getStartLocation()
	g.players[player.id] = &player
	player.run()
	g.sendInitEvent(player)
	g.sendJoinEvent(player)

	if g.status == IsDemo {
		g.sendStartMapEvent()
	}
}

func (g Game) RemovePlayer(player *Player) {
	delete(g.players, player.id)
}

func (g *Game) getPlayerStates() []models.PlayerDto {
	var playerStates []models.PlayerDto
	for _, player := range g.players {
		playerStates = append(playerStates, PlayerToDto(*player))
	}
	return playerStates
}

func (g Game) isRunning() bool {
	return g.status == IsGame || g.status == IsDemo
}

func (g Game) isDemo() bool {
	return g.status == IsDemo
}

func (g Game) isJoinable() bool {
	return g.status == IsLobby || g.status == IsDemo
}
