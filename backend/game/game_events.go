package game

import (
	"backend/models"
	"backend/util"
	"fmt"
)

// 1. Player joins lobby
//  -> send init event to player
//  -> send join event to everyone

// 2. Player sends IS_READY
//  -> when all players are ready, send START_MAP event (former init)

type event struct {
	Type string `json:"type"`
}

type initEvent struct {
	Type     string `json:"type"`
	PlayerId int64  `json:"playerId"`
	Name     string `json:"name"`
	Token    string `json:"token"`
}

func (g *Game) sendInitEvent(p *Player) {
	token, err := util.GeneratePlayerJWT(p.id, g.Id)

	if err != nil {
		fmt.Println("failed to create token: ", err)
		return
	}

	*p.playerEventsOut <- initEvent{
		Type:     "INIT",
		PlayerId: p.id,
		Name:     p.name,
		Token:    token,
	}
}

type joinEvent struct {
	Type     string `json:"type"`
	PlayerId int64  `json:"playerId"`
	Name     string `json:"name"`
}

func (g *Game) broadcastJoinEvent(p *Player) {
	*g.broadcast <- joinEvent{
		Type:     "JOIN",
		PlayerId: p.id,
		Name:     p.name,
	}
}

// Combination of init, startMap and turn_begin
type reconnectEvent struct {
	Type     string            `json:"type"`
	GameMap  models.GameMapDto `json:"gameMap"`
	IsDemo   bool              `json:"isDemo"`
	PlayerId int64             `json:"playerId"`
	Name     string            `json:"name"`
	IsTurn   bool              `json:"isTurn"`
}

func (g *Game) sendReconnectEvent(p *Player) {
	*p.playerEventsOut <- reconnectEvent{
		Type:     "RECONNECT",
		GameMap:  GameMapToDto(g.gameMap),
		IsDemo:   g.isDemo(),
		PlayerId: p.id,
		Name:     p.name,
		IsTurn:   p.status == IsPlayerTurn,
	}
}

type startMapEvent struct {
	Type    string            `json:"type"`
	GameMap models.GameMapDto `json:"gameMap"`
	IsDemo  bool              `json:"isDemo"`
}

func (g *Game) sendStartMapEvent(p *Player) {
	*p.playerEventsOut <- startMapEvent{
		Type:    "START_MAP",
		GameMap: GameMapToDto(g.gameMap),
		IsDemo:  g.isDemo(),
	}
}

func (g *Game) broadcastStartMapEvent() {
	*g.broadcast <- startMapEvent{
		Type:    "START_MAP",
		GameMap: GameMapToDto(g.gameMap),
		IsDemo:  g.isDemo(),
	}
}

type endMapEvent struct {
	Type       string             `json:"type"`
	IsGameOver bool               `json:"isGameOver"`
	Scores     map[string][]int64 `json:"scores"`
}

func (g *Game) broadcastEndMapEvent(isGameOver bool) {
	scores := make(map[string][]int64)
	for _, player := range g.players {
		scores[fmt.Sprintf("%d", player.id)] = player.scores
	}

	*g.broadcast <- endMapEvent{
		Type:       "END_MAP",
		IsGameOver: isGameOver,
		Scores:     scores,
	}
}

type statusChangeEvent struct {
	Type     string       `json:"type"`
	PlayerId int64        `json:"playerId"`
	Status   PlayerStatus `json:"status"`
}

func (g *Game) sendStatusChangeEvent(p *Player) {
	*p.playerEventsOut <- statusChangeEvent{
		Type:     "STATUS_CHANGE",
		PlayerId: p.id,
		Status:   p.status,
	}
}

type updateEvent struct {
	Type         string             `json:"type"`
	PlayerStates []models.PlayerDto `json:"playerStates"`
}

func (g *Game) broadcastUpdateEvent() {
	*g.broadcast <- updateEvent{
		Type:         "UPDATE",
		PlayerStates: g.getPlayerStates(),
	}
}

type effectEvent struct {
	Type     string        `json:"type"` // Effect
	Value    SpecialEffect `json:"value"`
	PlayerId int64         `json:"playerId"`
}

func (g *Game) broadcastEffectEvent(p *Player, effect SpecialEffect) {
	*g.broadcast <- effectEvent{
		Type:     "EFFECT",
		PlayerId: p.id,
		Value:    effect,
	}
}

type saveDemoMapEvent struct {
	Type string `json:"type"` // "SAVE_DEMO_MAP"
	Jwt  string `json:"jwt"`
}

func (g *Game) sendSaveDemoMapEvent(p *Player) {
	hash := GameMapToDto(g.gameMap).Hash()
	jwt, jwtErr := util.GenerateSaveMapJWT(hash)

	if jwtErr != nil {
		fmt.Println(jwtErr)
		g.sendError(p, "Something went wrong")
		return
	}

	*p.playerEventsOut <- saveDemoMapEvent{
		Type: "SAVE_DEMO_MAP",
		Jwt:  jwt,
	}
}

type errorEvent struct {
	Type  string `json:"type"` // "ERROR"
	Value string `json:"value"`
}

func (g *Game) sendError(p *Player, value string) {
	*p.playerEventsOut <- errorEvent{
		Type:  "ERROR",
		Value: value,
	}
}

type shotEvent struct {
	Type string  `json:"type"`
	X    float64 `json:"x"`
	Y    float64 `json:"y"`
}

func (g *Game) handleShotEvent(p *Player, event shotEvent) {
	if g.isRunning() {
		g.doShot(p, event)
	}
}

type isReadyEvent struct {
	Type  string `json:"type"`
	Value bool   `json:"value"`
}

func (g *Game) handleIsReadyEvent(player *Player, event isReadyEvent) {
	if g.status == IsGame || g.status == IsEnd {
		return
	}

	if event.Value {
		player.status = IsPlayerReady
	} else {
		player.status = IsPlayerWaiting
	}

	for _, p := range g.players {
		if p.status == IsPlayerWaiting {
			return
		}
	}

	g.status = IsGame
	g.runGame()
}
