package game

import (
	"backend/models"
	"fmt"
	"time"

	"github.com/gorilla/websocket"
)

type GameStatus int64

const (
	IsLobby GameStatus = iota
	IsGame
	IsWaiting
	IsEnd
	IsDemo // If is testing a new map.
	IsStopped
)

func (e GameStatus) String() string {
	switch e {
	case IsLobby:
		return "Lobby"
	case IsGame:
		return "Game"
	case IsWaiting:
		return "Waiting"
	case IsEnd:
		return "End"
	case IsDemo:
		return "Demo"
	case IsStopped:
		return "Stopped"
	default:
		return fmt.Sprintf("%d", int(e))
	}
}

type MapGenerator interface {
	next() (GameMap, bool)
}

type LoopMapGenerator struct {
	gameMap GameMap
}

func (lmg LoopMapGenerator) next() (gameMap GameMap, hasNext bool) {
	gameMap = lmg.gameMap
	hasNext = true
	return
}

type Game struct {
	*GameConn
	Id        string
	players   map[int64]*Player
	gameMap   GameMap
	mesh      colliderMesh
	status    GameStatus
	lastEvent time.Time // TODO: This should be player specific
	generator MapGenerator
}

func NewGame(gameId string, gameMap GameMap, isDemo bool) *Game {
	fmt.Println("Making new game:", gameId)
	broadcast := make(chan interface{})
	playerChannel := make(chan playerEvent)
	connections := GameConn{
		broadcast:     &broadcast,
		playerChannel: &playerChannel,
	}
	game := Game{
		Id:       gameId,
		players:  make(map[int64]*Player),
		gameMap:  gameMap,
		GameConn: &connections,
		mesh:     newColliderMesh(gameMap),
		status:   IsLobby,
		generator: LoopMapGenerator{
			gameMap,
		},
	}
	game.setEventTime()
	game.startCommunications()

	if isDemo {
		game.status = IsDemo
		game.runGame()
	}
	return &game
}

func (g *Game) AddPlayer(name string, ws *websocket.Conn) {
	player := NewPlayer(name, ws, g.playerChannel)
	player.ball.Pos = g.getStartLocation()
	g.players[player.id] = player
	player.run()
	g.sendInitEvent(player)
	g.broadcastJoinEvent(player)

	if g.isDemo() {
		g.sendStartMapEvent(player)
		player.status = PlayerHasTurn
		g.sendStatusChangeEvent(player)
	}
}

func (g *Game) ReconnectPlayer(id int64, ws *websocket.Conn) {
	// TODO: what if player not found?
	player := g.players[id]

	if player.isRunning {
		player.stop()
	}
	player.PlayerConn.ws = ws
	player.run()

	if g.isRunning() {
		g.sendReconnectEvent(player)
	} else {
		g.sendInitEvent(player)
	}
}

func (g *Game) RemovePlayer(player *Player) {
	delete(g.players, player.id)
}

func (g *Game) getPlayerStates() []models.PlayerDto {
	var playerStates []models.PlayerDto = make([]models.PlayerDto, 0)
	for _, player := range g.players {
		if player.status == PlayerHasTurn || player.status == PlayerIsMoving {
			playerStates = append(playerStates, PlayerToDto(*player))
		}
	}
	return playerStates
}

func (g *Game) isRunning() bool {
	return g.status == IsGame || g.isDemo()
}

func (g *Game) isDemo() bool {
	return g.status == IsDemo
}

func (g *Game) setEventTime() {
	g.lastEvent = time.Now()
}

func (g *Game) Stop() {
	fmt.Println("Stopping game", g.Id)
	g.status = IsStopped
	for _, p := range g.players {
		p.stop()
	}
}

func (g *Game) IsJoinable() bool {
	return g.status == IsLobby || g.isDemo()
}

func (g *Game) IsIdle() bool {
	return time.Since(g.lastEvent) > time.Hour
}

func (g *Game) PrettyString() string {
	id := fmt.Sprintf("  %s:", g.Id)
	players := fmt.Sprintf("    Players: %d", len(g.players))
	status := fmt.Sprintf("    Status: %v", g.status)
	event := fmt.Sprintf("    Event: %s", g.lastEvent.Format(time.RFC3339))
	return fmt.Sprintf("%s\n%s\n%s\n%s\n", id, players, status, event)
}
