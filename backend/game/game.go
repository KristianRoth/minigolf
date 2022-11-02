package game

type Game struct {
	game_id  int
	players  map[string]Player
	game_map int
}

func NewGame(game_map int) Game {
	return Game{
		game_id:  123,
		players:  make(map[string]Player),
		game_map: game_map,
	}
}

func (g Game) AddPlayer(player Player) {
	g.players[player.name] = player
}

func (g Game) RemovePlayer(player *Player) {
	delete(g.players, player.name)
}

func (g Game) Tick() {
	for _, player := range g.players {
		player.Update()
	}
}
