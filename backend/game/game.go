package game

import "fmt"

type Game struct {
	GameConn
	game_id  string
	players  map[string]Player
	game_map int
}

func NewGame(game_id string, game_map int) Game {
	fmt.Println("Making new game:", game_id)
	game := Game{
		game_id:  game_id,
		players:  make(map[string]Player),
		game_map: game_map,
		GameConn: GameConn{
			broadcast: make(chan string),
		},
	}
	go game.run()
	return game
}

func (g Game) AddPlayer(player Player) {
	g.players[player.name] = player
	g.sendAllPlayers("New player")
}

func (g Game) RemovePlayer(player *Player) {
	delete(g.players, player.name)
}

func (g Game) Tick() {
	for _, player := range g.players {
		player.Update()
	}
}
