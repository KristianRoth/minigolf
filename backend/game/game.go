package game

import (
	"github.com/gorilla/websocket"
)

type Game struct {
	GameConn
	game_id         string
	players         map[int64]*Player
	game_map        GameMap
	GamePreviewMode bool
	won             bool
}

func NewGame(game_id string, game_map GameMap) *Game {
	game := Game{
		game_id:         game_id,
		players:         make(map[int64]*Player),
		game_map:        game_map,
		GamePreviewMode: false,
		won:             false,
		GameConn: GameConn{
			broadcast:     make(chan interface{}),
			playerChannel: make(chan playerEvent),
		},
	}
	go game.run()
	go game.runGame()
	return &game
}

func (g *Game) AddPlayer(name string, ws websocket.Conn) {
	player := NewPlayer(name, ws, &g.playerChannel)
	player.ball.Pos = g.getStartLocation()
	g.players[player.id] = &player
	player.run()
	g.sendInitEvent(player)
}

func (g *Game) RemovePlayer(player *Player) {
	delete(g.players, player.id)
}
