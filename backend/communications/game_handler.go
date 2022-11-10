package communications

import (
	"backend/game"
	"backend/models"
	"fmt"

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

var Id = 12345

func (handler *GameHandler) GameFromMapDto(mapDto models.GameMapDto) string {
	g_id := fmt.Sprint(Id)
	Id += 1
	game_map := game.GameMapFromDto(mapDto)
	game := game.NewGame(g_id, game_map)
	game.GamePreviewMode = true
	fmt.Printf("New previewgame %s %p\n", g_id, game)
	handler.games[g_id] = game
	return g_id
}

func (handler *GameHandler) getDefaultGame(gameId string) *game.Game {
	if currentGame, ok := handler.games[gameId]; ok {
		fmt.Printf("Existing game found %s %p\n", gameId, currentGame)
		return currentGame
	}
	fmt.Println(gameId, "Doesnt exist")
	game_map := game.NewGameMap()
	game := game.NewGame(gameId, game_map)
	handler.games[gameId] = game
	return game
}

func (handler *GameHandler) NewConnection(gameId string, name string, ws websocket.Conn) {
	currentGame := handler.getDefaultGame(gameId)
	currentGame.AddPlayer(name, ws)
}
