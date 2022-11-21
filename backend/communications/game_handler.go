package communications

import (
	"backend/game"
	"backend/models"
	"backend/util"
	"fmt"
	"strings"

	"github.com/gorilla/websocket"
)

type GameHandler struct {
	games map[string]*game.Game
}

func NewGameHandler() GameHandler {
	return GameHandler{
		games: make(map[string]*game.Game),
	}
}

func (handler *GameHandler) GameFromMapDto(mapDto models.GameMapDto, is_demo bool) string {
	g_id := strings.ToUpper(util.RandomString(5))
	game_map := game.GameMapFromDto(mapDto)
	game := game.NewGame(g_id, game_map, is_demo)
	handler.games[g_id] = &game
	return g_id
}

func (handler *GameHandler) getDefaultGame(gameId string) game.Game {
	if currentGame, ok := handler.games[gameId]; ok {
		fmt.Println(gameId, "Exists")
		return *currentGame
	}
	fmt.Println(gameId, "Doesnt exist")
	game_map := game.NewGameMap()
	game := game.NewGame(gameId, game_map, true)
	handler.games[gameId] = &game
	return game
}

func (handler *GameHandler) NewConnection(gameId string, name string, ws websocket.Conn) {
	currentGame := handler.getDefaultGame(gameId)
	currentGame.AddPlayer(name, ws)
}
