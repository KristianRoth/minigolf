package communications

import (
	"backend/game"
	"fmt"

	"github.com/gorilla/websocket"
)

type GameHandler struct {
	games map[string]game.Game
}

func NewGameHandler() GameHandler {
	return GameHandler{
		games: make(map[string]game.Game),
	}
}

func (handler GameHandler) getDefaultGame(gameId string) game.Game {
	if currentGame, ok := handler.games[gameId]; ok {
		fmt.Println(gameId, "Exists")
		return currentGame
	}
	fmt.Println(gameId, "Doesnt exist")
	game := game.NewGame(gameId, 1)
	handler.games[gameId] = game
	return game
}

func (handler GameHandler) NewConnection(gameId string, name string, ws websocket.Conn) {
	currentGame := handler.getDefaultGame(gameId)

	player := game.NewPlayer(name, ws)
	currentGame.AddPlayer(player)
}
