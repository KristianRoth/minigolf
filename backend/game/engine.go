package game

import (
	"backend/calc"
	"backend/models"
	"errors"
	"fmt"
	"math"
	"time"
)

type SpecialEffect int64

const (
	HoleEffect SpecialEffect = iota
	NoEffect
)

func (g *Game) runGame() {
	for {
		g.sendUpdateEvent()
		g.tick()
		<-time.After(time.Second / 30)
	}
}

func (g *Game) tick() {
	for _, player := range g.players {
		ball, effect := g.Collide(player.ball)
		if effect == HoleEffect {
			player.ball = newBall(g.getStartLocation(), calc.NewVec(0.0, 0.0))
			player.shot_count = 0
			continue
		}
		player.ball = ball
		if !player.is_turn && player.ball.Vel.Length() <= 1.0 {
			player.is_turn = true
			g.sendTurnBeginEvent(*player)
		}
	}
}
func (g Game) getStartLocation() calc.Vector {
	start := calc.Vector{}
	for _, col := range g.game_map.Tiles {
		for _, tile := range col {
			if tile.Structure.Type == models.Start {
				start = tile.Pos
			}
		}
	}
	return start.Add(calc.NewVec(50, 50))
}

func (g Game) getClosestCollision(ball Ball) (CollisionPoint, error) {
	x_start := uint32(math.Max(0, (ball.Pos.X-100.0)/100.0))
	x_end := uint32(math.Min(float64(x_start+5), SIZE_X))

	y_start := uint32(math.Max(0, (ball.Pos.Y-100.0)/100.0))
	y_end := uint32(math.Min(float64(y_start+5), SIZE_Y))

	close_tiles := []GameMapTile{}
	for x := x_start; x < x_end; x += 1 {
		for y := y_start; y < y_end; y += 1 {
			close_tiles = append(close_tiles, g.game_map.Tiles[x][y])
		}
	}
	// Find closest from close_tiles
	collision_points := []CollisionPoint{}
	for _, tile := range close_tiles {
		collision_points = append(collision_points, getCollisionPoints(tile.Structure, tile.Pos, ball)...)
	}

	if len(collision_points) == 0 {
		return CollisionPoint{}, errors.New("no collision points")
	}

	closest := collision_points[0]
	for _, cp := range collision_points {
		dist := cp.Point.Distance(ball.Pos)
		if dist < closest.Point.Distance(ball.Pos) {
			closest = cp
		}
	}
	return closest, nil
}

func (g Game) doGroundEffect(ball Ball) Ball {
	x := uint32(ball.Pos.X / 100)
	y := uint32(ball.Pos.Y / 100)
	tile := g.game_map.Tiles[x][y]
	switch tile.Ground.Type {
	case models.Grass:
		return ball.Clone()
	case models.Water:
		return newBall(g.getStartLocation(), calc.NewVec(0.0, 0.0))
	case models.Gravel:
		return newBall(ball.Pos, ball.Vel.Multiply(0.8))
	case models.GravelHeavy:
		return newBall(ball.Pos, ball.Vel.Multiply(0.5))
	case models.Slope:
		slope := calc.NewVec(0.0, -1.0).Rotate(calc.NewVec(0.0, 0.0), tile.Ground.Rotation)
		return newBall(ball.Pos, ball.Vel.Add(slope))
	case models.SlopeDiagonal:
		slope := calc.NewVec(-1.0, -1.0).Rotate(calc.NewVec(0.0, 0.0), tile.Ground.Rotation)
		return newBall(ball.Pos, ball.Vel.Add(slope))
	}
	return ball.Clone()
}

func (g Game) Collide(ball Ball) (Ball, SpecialEffect) {
	ball = newBall(ball.Pos, ball.Vel.Multiply(0.97))
	ball = g.doGroundEffect(ball)
	d_pos := ball.Vel.Length()
	if d_pos < 1.0 {
		return ball, NoEffect
	}
	for {
		collision, err := g.getClosestCollision(ball)
		if err != nil {
			ball = ball.Move(d_pos)
			return ball, NoEffect
		}

		distance_to_wall := collision.Point.Distance(ball.Pos)
		if distance_to_wall < BALL_SIZE {
			if collision.Type == models.Hole {
				return ball, HoleEffect
			}
			fmt.Printf("Seinä %f, %f\n", collision.Point.X, collision.Point.Y)
			fmt.Printf("Pallo %f, %f\n", ball.Pos.X, ball.Pos.Y)
			ball = doCollision(collision.Point, ball)
		}
		to_move := math.Max(1, math.Min(d_pos, distance_to_wall-49.9))

		fmt.Printf("adding some: %f/%f\n", to_move, ball.Vel.Length())

		ball = ball.Move(to_move)
		d_pos -= to_move
		if d_pos < 0.0001 {
			return ball, NoEffect
		}
	}
}

func doCollision(projectionPoint calc.Vector, ball Ball) Ball {
	basis := ball.Pos.Subtract(projectionPoint).Unit()
	basis_changed := ball.Vel.ChangeBase(basis)
	basis_changed.X = -basis_changed.X

	vel := basis_changed.NormalBase(basis)
	pos := projectionPoint.Add(basis.Multiply(50.1))
	return newBall(pos, vel)
}

func (g *Game) doShotEvent(p *Player, event shotEvent) {
	p.ball.Vel.X = event.X / 10
	p.ball.Vel.Y = event.Y / 10
	p.shot_count += 1
	p.is_turn = false
}
