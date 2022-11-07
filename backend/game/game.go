package game

import (
	"fmt"

	"github.com/gorilla/websocket"
)

type Game struct {
	GameConn
	game_id  string
	players  map[string]Player
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
		players:  make(map[string]Player),
		game_map: game_map,
		GameConn: GameConn{
			broadcast:     make(chan string),
			playerChannel: make(chan string),
		},
	}
	go game.run()
	return game
}

func (g Game) AddPlayer(name string, ws websocket.Conn) {
	g.players[name] = NewPlayer(name, ws, &g.playerChannel)
	message := fmt.Sprintf("New player %s", name)
	g.sendAllPlayers(message)

}

func (g Game) RemovePlayer(player *Player) {
	delete(g.players, player.name)
}
