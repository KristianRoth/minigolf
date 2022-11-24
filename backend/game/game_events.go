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
}

func (g Game) sendInitEvent(p Player) {
	p.PlayerEventsOut <- initEvent{
		Type:     "INIT",
		PlayerId: p.id,
		Name:     p.name,
	}
}

type joinEvent struct {
	Type     string `json:"type"`
	PlayerId int64  `json:"playerId"`
	Name     string `json:"name"`
}

func (g Game) sendJoinEvent(p Player) {
	g.broadcast <- joinEvent{
		Type:     "JOIN",
		PlayerId: p.id,
		Name:     p.name,
	}
}

type startMapEvent struct {
	Type    string            `json:"type"`
	GameMap models.GameMapDto `json:"gameMap"`
	IsDemo  bool              `json:"isDemo"`
}

func (g Game) sendStartMapEvent() {
	g.broadcast <- startMapEvent{
		Type:    "START_MAP",
		GameMap: GameMapToDto(g.game_map),
		IsDemo:  g.isDemo(),
	}
}

type turnBeginEvent struct {
	Type     string `json:"type"`
	PlayerId int64  `json:"playerId"`
}

func (g Game) sendTurnBeginEvent(p Player) {
	p.PlayerEventsOut <- turnBeginEvent{
		Type:     "TURN_BEGIN",
		PlayerId: p.id,
	}
}

type updateEvent struct {
	Type         string             `json:"type"`
	PlayerStates []models.PlayerDto `json:"playerStates"`
}

func (g Game) sendUpdateEvent() {
	g.broadcast <- updateEvent{
		Type:         "UPDATE",
		PlayerStates: g.getPlayerStates(),
	}
}

type effectEvent struct {
	Type     string        `json:"type"` // Effect
	Value    SpecialEffect `json:"value"`
	PlayerId int64         `json:"playerId"`
}

func (g Game) sendEffectEvent(p Player, effect SpecialEffect) {
	g.broadcast <- effectEvent{
		Type:     "EFFECT",
		PlayerId: p.id,
		Value:    effect,
	}
}

type saveDemoMapEvent struct {
	Type string `json:"type"` // "SAVE_DEMO_MAP"
	Jwt  string `json:"jwt"`
}

func (g Game) sendSaveDemoMapEvent(p Player) {
	hash := GameMapToDto(g.game_map).Hash()
	jwt, jwt_err := util.GenerateSaveMapJWT(hash)

	if jwt_err != nil {
		fmt.Println(jwt_err)
		g.sendError(p, "Something went wrong")
		return
	}

	p.PlayerEventsOut <- saveDemoMapEvent{
		Type: "SAVE_DEMO_MAP",
		Jwt:  jwt,
	}
}

type errorEvent struct {
	Type  string `json:"type"` // "ERROR"
	Value string `json:"value"`
}

func (g Game) sendError(p Player, value string) {
	p.PlayerEventsOut <- errorEvent{
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

	player.is_ready = event.Value

	for _, p := range g.players {
		if !p.is_ready {
			return
		}
	}

	g.status = IsGame
	g.sendStartMapEvent()
	g.runGame()
}
