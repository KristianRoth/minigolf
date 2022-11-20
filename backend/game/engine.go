package game

import (
	"backend/calc"
	"backend/database"
	"backend/models"
	"errors"
	"fmt"
	"math"
	"time"
)

// func timeTrack(start time.Time, name string) {
// 	elapsed := time.Since(start)
// 	fmt.Printf("%s took %s\n", name, elapsed)
// }

func (g *Game) runGame() {
	for {
		// TODO: Skip if there is no state-change.
		g.sendUpdateEvent()
		g.tick()
		<-time.After(time.Second / TICK)
	}
}

func (g *Game) tick() {
	// defer timeTrack(time.Now(), "tick")
	for _, player := range g.players {
		ball, effect := g.Collide(player.ball)
		if effect != NoEffect {
			g.sendEffectEvent(*player, effect)
		}

		switch effect {
		case HoleEffect:
			score := player.shot_count
			err := database.UpdateGameMapStats(g.game_map.Id, score)
			if err != nil {
				fmt.Printf("Stat update failed: %s\n", err)
			}
			player.ball = newBall(g.getStartLocation(), calc.NewVec(0.0, 0.0))
			player.shot_count = 0
		case WaterEffect:
			player.ball = newBall(player.prev_ball.Pos, calc.NewVec(0.0, 0.0))
		default:
			player.ball = ball
		}

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
	return start.Add(calc.NewVec(TILE_SIZE/2, TILE_SIZE/2))
}

func (g Game) getClosestCollision(ball Ball) (collisionPoint, error) {
	x_start := uint32(math.Max(0, (ball.Pos.X-TILE_SIZE)/TILE_SIZE))
	x_end := uint32(math.Min(float64(x_start+5), SIZE_X))

	y_start := uint32(math.Max(0, (ball.Pos.Y-TILE_SIZE)/TILE_SIZE))
	y_end := uint32(math.Min(float64(y_start+5), SIZE_Y))

	close_tiles := []GameMapTile{}
	for x := x_start; x < x_end; x += 1 {
		for y := y_start; y < y_end; y += 1 {
			close_tiles = append(close_tiles, g.game_map.Tiles[x][y])
		}
	}
	// Find closest from close_tiles
	collision_points := []collisionPoint{}
	for _, tile := range close_tiles {
		collision_points = append(collision_points, g.mesh.getCollisionPoints(tile, ball)...)
	}

	if len(collision_points) == 0 {
		return collisionPoint{}, errors.New("no collision points")
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

func (g Game) doGroundEffect(ball Ball) (Ball, SpecialEffect) {
	x := uint32(ball.Pos.X / TILE_SIZE)
	y := uint32(ball.Pos.Y / TILE_SIZE)
	tile := g.game_map.Tiles[x][y]

	ball = newBall(ball.Pos, ball.Vel.Multiply(FRICTION)) // Previously 0.97
	switch tile.Ground.Type {
	case models.Grass:
		return ball.Clone(), NoEffect
	case models.Water:
		return ball.Clone(), WaterEffect
	case models.Gravel:
		return newBall(ball.Pos, ball.Vel.Multiply(GRAVEL_FRICTION)), NoEffect
	case models.GravelHeavy:
		return newBall(ball.Pos, ball.Vel.Multiply(GRAVEL_HEAVY_FRICTION)), NoEffect
	case models.Slope:
		slope := calc.NewVec(0, -1).SetLength(SLOPE_GRAVITY).Rotate(calc.NewVec(0, 0), tile.Ground.Rotation)
		return newBall(ball.Pos, ball.Vel.Add(slope)), NoEffect
	case models.SlopeDiagonal:
		slope := calc.NewVec(-1, -1).SetLength(SLOPE_GRAVITY).Rotate(calc.NewVec(0, 0), tile.Ground.Rotation)
		return newBall(ball.Pos, ball.Vel.Add(slope)), NoEffect
	}
	return ball.Clone(), NoEffect
}

func (g Game) Collide(ball Ball) (Ball, SpecialEffect) {
	ball, effect := g.doGroundEffect(ball)

	if effect == WaterEffect {
		return ball, effect
	}

	d_pos := ball.Vel.Length()
	if d_pos < 1.0 {
		return ball.Stop(), NoEffect
	}

	var collision_effect SpecialEffect = NoEffect
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
			collision_effect = CollisionEffect
		}
		to_move := math.Max(1, math.Min(d_pos, distance_to_wall-BALL_SIZE+0.1))

		fmt.Printf("adding some: %f/%f\n", to_move, ball.Vel.Length())

		ball = ball.Move(to_move)
		d_pos -= to_move
		if d_pos < 0.0001 {
			return ball, collision_effect
		}
	}
}

func doCollision(projectionPoint calc.Vector, ball Ball) Ball {
	basis := ball.Pos.Subtract(projectionPoint).Unit()
	basis_changed := ball.Vel.ChangeBase(basis)
	basis_changed.X = -basis_changed.X

	vel := basis_changed.NormalBase(basis).Multiply(WALL_COLLISION_BOUNCE)
	pos := projectionPoint.Add(basis.Multiply(BALL_SIZE + 0.1))
	return newBall(pos, vel)
}

func (g *Game) doShot(p *Player, event shotEvent) {
	p.prev_ball = p.ball.Clone()
	p.ball.Vel.X = event.X / 10
	p.ball.Vel.Y = event.Y / 10
	p.shot_count += 1
	p.is_turn = false
}
