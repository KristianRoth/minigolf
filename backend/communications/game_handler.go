package communications

import (
	"backend/game"
	"backend/models"
	"backend/util"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

type GameHandler struct {
	isRunning bool
	games     map[string]*game.Game
}

func NewGameHandler() GameHandler {
	return GameHandler{
		games:     make(map[string]*game.Game),
		isRunning: false,
	}
}

func (handler *GameHandler) PrettyString() string {
	if len(handler.games) == 0 {
		return "No games"
	}
	stateStr := "Games:\n"
	for _, game := range handler.games {
		stateStr += game.PrettyString()
	}
	return stateStr
}

func (handler *GameHandler) Start() {
	if handler.isRunning {
		return
	}
	handler.isRunning = true
	go func() {
		for {
			// handler.PrintState()
			for _, game := range handler.games {
				if game.IsIdle() {
					game.Stop()
					delete(handler.games, game.Id)
				}
			}
			<-time.After(time.Minute)
		}
	}()
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
