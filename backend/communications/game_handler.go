package communications

import (
	"backend/game"

	"github.com/gorilla/websocket"
)

type GameHandler struct {
	games map[string]game.Game
}

func (handler GameHandler) NewConnection(gameId string, ws websocket.Conn) {

}
