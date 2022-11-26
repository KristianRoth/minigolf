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

func (handler *GameHandler) GameFromMapDto(mapDto models.GameMapDto, isDemo bool) string {
	gameId := strings.ToUpper(util.RandomString(5))
	gameMap := game.GameMapFromDto(mapDto)
	game := game.NewGame(gameId, gameMap, isDemo)
	handler.games[gameId] = game
	return gameId
}

func (handler *GameHandler) CreateGame() string {
	gameId := strings.ToUpper(util.RandomString(5))
	game := game.NewGame(gameId, game.NewGameMap(), false)
	handler.games[gameId] = game
	return gameId
}

func (handler *GameHandler) NewConnection(gameId string, name string, ws *websocket.Conn) {
	if currentGame, ok := handler.games[gameId]; ok {
		currentGame.AddPlayer(name, ws)
	}
}

func (handler *GameHandler) RenewConnection(gameId string, playerId int64, ws *websocket.Conn) {
	if currentGame, ok := handler.games[gameId]; ok {
		currentGame.ReconnectPlayer(playerId, ws)
	}
}

func (handler *GameHandler) GameExists(gameId string) bool {
	_, exists := handler.games[gameId]
	return exists
}

func (handler *GameHandler) GameJoinable(gameId string) bool {
	game, exists := handler.games[gameId]
	return exists && game.IsJoinable()
}
