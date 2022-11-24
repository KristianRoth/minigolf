package communications

import (
	"backend/game"
	"backend/models"
	"backend/util"
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

func (handler *GameHandler) CreateGame() string {
	g_id := strings.ToUpper(util.RandomString(5))
	game := game.NewGame(g_id, game.NewGameMap(), false)
	handler.games[g_id] = &game
	return g_id
}

func (handler *GameHandler) NewConnection(gameId string, name string, ws websocket.Conn) {
	if currentGame, ok := handler.games[gameId]; ok {
		currentGame.AddPlayer(name, ws)
	}
}

func (handler *GameHandler) GameExists(gameId string) bool {
	_, exists := handler.games[gameId]
	return exists
}
