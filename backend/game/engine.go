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

func (g Game) runGame() {
	for {
		fmt.Println("Running game tick")
		g.sendUpdateEvent()
		g.tick()
		<-time.After(time.Second)
	}
}

func (g Game) tick() {
	for _, player := range g.players {
		ball, effect := g.Collide(player.ball)
		if effect == HoleEffect {
			player.ball = newBall(g.getStartLocation(), calc.NewVec(0.0, 0.0))
			player.shot_count = 0
			return
		}
		player.ball = ball
	}
}
func (g Game) getStartLocation() calc.Vector {
	start := calc.NewVec(0.0, 0.0)
	for _, col := range g.game_map.Tiles {
		for _, tile := range col {
			if tile.Structure.Type == models.None {
				start = tile.Pos
			}
		}
	}
	return start.Add(calc.NewVec(50.0, 50.0))
}

func (g Game) getClosestCollision(ball Ball) (CollisionPoint, error) {
	x_start := uint32(math.Max(0, (ball.Pos.X-100.0)/100.0))
	y_start := uint32(math.Max(0, (ball.Pos.Y-100.0)/100.0))

	close_tiles := []GameMapTile{}
	for x := x_start; x < x_start+5; x += 1 {
		for y := y_start; y < y_start+5; y += 1 {
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
			return ball.Move(d_pos), NoEffect
		}

		distance_to_wall := collision.Point.Distance(ball.Pos)
		if distance_to_wall < BALL_SIZE {
			if collision.Type == models.Hole {
				return ball, HoleEffect
			}
			ball = doCollision(collision.Point, ball)
		}
		to_move := math.Min(d_pos, distance_to_wall-49.9)
		ball = ball.Move(to_move)
		d_pos -= to_move
		if d_pos < 0.0001 {
			return ball, NoEffect
		}
		return ball, NoEffect
	}
}

func doCollision(projectionPoint calc.Vector, ball Ball) Ball {
	basis := ball.Pos.Subtract(projectionPoint).Unit()
	basis_changed := ball.Vel.ChangeBase(basis)
	basis_changed.X = -basis_changed.X

	vel := basis_changed.NormalBase(basis)
	pos := projectionPoint.Add(basis.Multiply(1.05 * BALL_SIZE))
	return newBall(pos, vel)
}
