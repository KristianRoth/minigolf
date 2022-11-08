package game

import (
	"fmt"

	"github.com/gorilla/websocket"
)

type Game struct {
	GameConn
	game_id  string
	players  map[string]*Player
	game_map GameMap
}

func NewGame(game_id string, game_map_id string) Game {
	fmt.Println("Making new game:", game_id)
	// TODO: load from database
	game_map := NewGameMap()
	game_map.Id = game_map_id
	//
	game := Game{
		game_id:  game_id,
		players:  make(map[string]*Player),
		game_map: game_map,
		GameConn: GameConn{
			broadcast:     make(chan interface{}),
			playerChannel: make(chan playerEvent),
		},
	}
	go game.run()
	go game.runGame()
	return game
}

func (g Game) AddPlayer(name string, ws websocket.Conn) {
	player := NewPlayer(name, ws, &g.playerChannel)
	g.players[name] = &player
	go player.run()
	g.sendInitEvent(player)
}

func (g Game) RemovePlayer(player *Player) {
	delete(g.players, player.name)
}
