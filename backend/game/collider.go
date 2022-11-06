package game

import (
	"backend/calc"
	"backend/models"
)

var mid = calc.NewVec(50.0, 50.0)

type collider interface {
	projectionPoint(position calc.Vector, ball calc.Vector, rot models.Rotation) (calc.Vector, error)
}

// Point
type pointCollider struct {
	Pos calc.Vector
}

func (pc pointCollider) projectionPoint(position calc.Vector, ball calc.Vector, rot models.Rotation) (calc.Vector, error) {
	return pc.Pos.Rotate(mid, rot).Add(position), nil
}

// Circle
type circleCollider struct {
	Pos    calc.Vector
	Radius float64
}

func (cc circleCollider) projectionPoint(position calc.Vector, ball calc.Vector, rot models.Rotation) (calc.Vector, error) {
	centre := cc.Pos.Rotate(mid, rot).Add(position)
	dir := ball.Subtract(centre).Unit().Multiply(cc.Radius)
	return centre.Add(dir), nil
}

// Line
type lineCollider struct {
	Pos calc.Vector
	Dir calc.Vector
}

func (lc lineCollider) projectionPoint(position calc.Vector, ball calc.Vector, rot models.Rotation) (calc.Vector, error) {
	return calc.NewLine(lc.Pos, lc.Dir).Rotate(mid, rot).AddToPos(position).ProjectPoint(ball)
}

// Arc
type arcCollider struct {
	Pos    calc.Vector
	Start  calc.Vector
	End    calc.Vector
	Radius float64
}

func (ac arcCollider) projectionPoint(position calc.Vector, ball calc.Vector, rot models.Rotation) (calc.Vector, error) {
	return calc.NewArc(ac.Pos, ac.Radius, ac.Start, ac.End).ProjectPoint(ball, rot)
}

var origin = calc.NewVec(0.0, 0.0)
var north = calc.NewVec(100.0, 0.0)
var northeast = calc.NewVec(100.0, 100.0)
var east = calc.NewVec(0.0, 100.0)

// var southeast = NewVec(-100.0, 100.0)
var south = calc.NewVec(0.0, -100.0)

// var southwest = NewVec(-100.0, -100.0)
var west = calc.NewVec(-100.0, 0)
var northwest = calc.NewVec(-100.0, 100.0)

var boxColliders []collider = []collider{
	pointCollider{Pos: origin},
	lineCollider{Pos: origin, Dir: east},
	pointCollider{Pos: east},
	lineCollider{Pos: east, Dir: north},
	pointCollider{Pos: northeast},
	lineCollider{Pos: northeast, Dir: west},
	pointCollider{Pos: north},
	lineCollider{Pos: north, Dir: south},
}

var wedgeColliders []collider = []collider{
	pointCollider{Pos: origin},
	lineCollider{Pos: origin, Dir: east},
	pointCollider{Pos: east},
	lineCollider{Pos: east, Dir: northwest},
	pointCollider{Pos: east},
	lineCollider{Pos: east, Dir: west},
}

var roundedCornerColliders []collider = []collider{
	pointCollider{Pos: origin},
	lineCollider{Pos: origin, Dir: east},
	pointCollider{Pos: east},
	arcCollider{Pos: origin, Radius: 100.0, Start: calc.NewVec(1.0, 0.0), End: calc.NewVec(0.0, 1.0)},
	pointCollider{Pos: north},
	lineCollider{Pos: north, Dir: south},
}

var invertedRoundedCornerColliders []collider = []collider{
	pointCollider{Pos: origin},
	lineCollider{Pos: origin, Dir: east},
	pointCollider{Pos: east},
	arcCollider{Pos: northeast, Radius: 100.0, Start: calc.NewVec(-1.0, 0.0), End: calc.NewVec(0.0, -1.0)},
	pointCollider{Pos: north},
	lineCollider{Pos: north, Dir: south},
}

var circleColliders []collider = []collider{
	circleCollider{Pos: mid, Radius: 24.0},
}

type CollisionPoint struct {
	Point calc.Vector
	Type  models.StructureType
}

func getCollisionPoints(structure models.Structure, pos calc.Vector, ball Ball) []CollisionPoint {
	colliders := getColliders(structure.Type)
	var points []CollisionPoint = []CollisionPoint{}
	for _, collider := range colliders {
		point, err := collider.projectionPoint(pos, ball.Pos, structure.Rotation)
		if err == nil {
			points = append(points, CollisionPoint{Point: point, Type: structure.Type})
		}
	}
	return points
}

func getColliders(structure_type models.StructureType) []collider {
	switch structure_type {
	case models.Wall:
		return boxColliders
	case models.Circle:
		return circleColliders
	case models.Wedge:
		return wedgeColliders
	case models.RoundedCorner:
		return roundedCornerColliders
	case models.InvertedRoundedCorner:
		return invertedRoundedCornerColliders
	case models.Hole:
		return circleColliders
	}
	return []collider{}
}
