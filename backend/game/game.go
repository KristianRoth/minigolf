package game

import (
	"fmt"

	"github.com/gorilla/websocket"
)

type Game struct {
	GameConn
	game_id  string
	players  map[int64]*Player
	game_map GameMap
	mesh     colliderMesh
}

func NewGame(game_id string, game_map GameMap) Game {
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
	go game.run()
	go game.runGame()
	return game
}

func (g *Game) AddPlayer(name string, ws websocket.Conn) {
	player := NewPlayer(name, ws, &g.playerChannel)
	player.ball.Pos = g.getStartLocation()
	g.players[player.id] = &player
	player.run()
	g.sendInitEvent(player)
}

func (g Game) RemovePlayer(player *Player) {
	delete(g.players, player.id)
}
