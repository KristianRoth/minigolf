package game

import (
	"backend/calc"
	"backend/models"
	"errors"
	"math"
	"strconv"
)

const SIZE_X = 49
const SIZE_Y = 25
const BALL_SIZE = 50.0

type SpecialEffect int64

const (
	HoleEffect SpecialEffect = iota
	NoEffect
)

var next_id = 1

type GameMapTile struct {
	Pos       calc.Vector
	Ground    models.Ground
	Structure models.Structure
}

type GameMap struct {
	Id    string
	Tiles [][]GameMapTile
}

func NewGameMap() GameMap {
	tiles := [][]GameMapTile{}
	id := next_id
	next_id += 1

	for x := 0; x < SIZE_X; x += 1 {
		tiles_col := []GameMapTile{}
		for y := 0; y < SIZE_Y; y += 1 {
			is_border := x == 0 || y == 0 || x == SIZE_X-1 || y == SIZE_Y-1
			var structure_type models.StructureType = models.None
			if is_border {
				structure_type = models.Wall
			}
			tiles_col = append(
				tiles_col,
				GameMapTile{
					Pos:       calc.NewVec(float64(x)*100.0, float64(y)*100.0),
					Ground:    models.Ground{Type: models.Grass, Rotation: models.North},
					Structure: models.Structure{Type: structure_type, Rotation: models.North},
				})
		}
		tiles = append(tiles, tiles_col)
	}
	return GameMap{
		Id:    strconv.Itoa(id),
		Tiles: tiles,
	}
}

func (gameMap GameMap) GetStartLocation() calc.Vector {
	start := calc.NewVec(0.0, 0.0)
	for _, col := range gameMap.Tiles {
		for _, tile := range col {
			if tile.Structure.Type == models.None {
				start = tile.Pos
			}
		}
	}
	return start.Add(calc.NewVec(50.0, 50.0))
}

func (gameMap *GameMap) GetClosestCollision(ball Ball) (CollisionPoint, error) {
	x_start := uint32(math.Max(0, (ball.Pos.X-100.0)/100.0))
	y_start := uint32(math.Max(0, (ball.Pos.Y-100.0)/100.0))

	close_tiles := []GameMapTile{}
	for x := x_start; x < x_start+5; x += 1 {
		for y := y_start; y < y_start+5; y += 1 {
			close_tiles = append(close_tiles, gameMap.Tiles[x][y])
		}
	}
	// Find closest from close_tiles
	collision_points := []CollisionPoint{}
	for _, tile := range close_tiles {
		collision_points = append(collision_points, GetCollisionPoints(tile.Structure, tile.Pos, ball)...)
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

func (gameMap GameMap) DoGroundEffect(ball Ball) Ball {
	x := uint32(ball.Pos.X)
	y := uint32(ball.Pos.Y)
	tile := gameMap.Tiles[x][y]
	switch tile.Ground.Type {
	case models.Grass:
		return ball.Clone()
	case models.Water:
		return NewBall(gameMap.GetStartLocation(), calc.NewVec(0.0, 0.0))
	case models.Gravel:
		return NewBall(ball.Pos, ball.Vel.Multiply(0.8))
	case models.GravelHeavy:
		return NewBall(ball.Pos, ball.Vel.Multiply(0.5))
	case models.Slope:
		slope := calc.NewVec(0.0, -1.0).Rotate(calc.NewVec(0.0, 0.0), tile.Ground.Rotation)
		return NewBall(ball.Pos, ball.Vel.Add(slope))
	case models.SlopeDiagonal:
		slope := calc.NewVec(-1.0, -1.0).Rotate(calc.NewVec(0.0, 0.0), tile.Ground.Rotation)
		return NewBall(ball.Pos, ball.Vel.Add(slope))
	}
	return ball.Clone()
}

func (gameMap GameMap) Collide(ball Ball) (Ball, SpecialEffect) {
	ball = gameMap.DoGroundEffect(ball)
	d_pos := ball.Vel.Length()
	if d_pos < 1.0 {
		return ball, NoEffect
	}
	for {
		collision, err := gameMap.GetClosestCollision(ball)
		if err != nil {
			return ball.Move(d_pos), NoEffect
		}

		distance_to_wall := collision.Point.Distance(ball.Pos)
		if distance_to_wall < BALL_SIZE {
			if collision.Type == models.Hole {
				return ball, HoleEffect
			}
			ball = DoCollision(collision.Point, ball)
		}
		to_move := math.Min(d_pos, distance_to_wall-49.9)
		ball = ball.Move(to_move)
		d_pos -= to_move

		if d_pos < 0.0001 {
			return ball, NoEffect
		}
	}
}

func DoCollision(projectionPoint calc.Vector, ball Ball) Ball {
	basis := ball.Pos.Subtract(projectionPoint).Unit()
	basis_changed := ball.Vel.ChangeBase(basis)
	basis_changed.X = -basis_changed.X

	vel := basis_changed.NormalBase(basis)
	pos := projectionPoint.Add(basis.Multiply(1.05 * BALL_SIZE))
	return NewBall(pos, vel)
}
