package game

import (
	"backend/calc"
	"backend/models"
)

var mid = calc.NewVec(50.0, 50.0)

type Collider interface {
	ProjectionPoint(position calc.Vector, ball calc.Vector, rot models.Rotation) (calc.Vector, error)
}

// Point
type PointCollider struct {
	Pos calc.Vector
}

func (pc PointCollider) ProjectionPoint(position calc.Vector, ball calc.Vector, rot models.Rotation) (calc.Vector, error) {
	return pc.Pos.Rotate(mid, rot).Add(position), nil
}

// Circle
type CircleCollider struct {
	Pos    calc.Vector
	Radius float64
}

func (cc CircleCollider) ProjectionPoint(position calc.Vector, ball calc.Vector, rot models.Rotation) (calc.Vector, error) {
	centre := cc.Pos.Rotate(mid, rot).Add(position)
	dir := ball.Subtract(centre).Unit().Multiply(cc.Radius)
	return centre.Add(dir), nil
}

// Line
type LineCollider struct {
	Pos calc.Vector
	Dir calc.Vector
}

func (lc LineCollider) ProjectionPoint(position calc.Vector, ball calc.Vector, rot models.Rotation) (calc.Vector, error) {
	return calc.NewLine(lc.Pos, lc.Dir).Rotate(mid, rot).AddToPos(position).ProjectPoint(ball)
}

// Arc
type ArcCollider struct {
	Pos    calc.Vector
	Start  calc.Vector
	End    calc.Vector
	Radius float64
}

func (ac ArcCollider) ProjectionPoint(position calc.Vector, ball calc.Vector, rot models.Rotation) (calc.Vector, error) {
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

var BoxColliders []Collider = []Collider{
	PointCollider{Pos: origin},
	LineCollider{Pos: origin, Dir: east},
	PointCollider{Pos: east},
	LineCollider{Pos: east, Dir: north},
	PointCollider{Pos: northeast},
	LineCollider{Pos: northeast, Dir: west},
	PointCollider{Pos: north},
	LineCollider{Pos: north, Dir: south},
}

var WedgeColliders []Collider = []Collider{
	PointCollider{Pos: origin},
	LineCollider{Pos: origin, Dir: east},
	PointCollider{Pos: east},
	LineCollider{Pos: east, Dir: northwest},
	PointCollider{Pos: east},
	LineCollider{Pos: east, Dir: west},
}

var RoundedCornerColliders []Collider = []Collider{
	PointCollider{Pos: origin},
	LineCollider{Pos: origin, Dir: east},
	PointCollider{Pos: east},
	ArcCollider{Pos: origin, Radius: 100.0, Start: calc.NewVec(1.0, 0.0), End: calc.NewVec(0.0, 1.0)},
	PointCollider{Pos: north},
	LineCollider{Pos: north, Dir: south},
}

var InvertedRoundedCornerColliders []Collider = []Collider{
	PointCollider{Pos: origin},
	LineCollider{Pos: origin, Dir: east},
	PointCollider{Pos: east},
	ArcCollider{Pos: northeast, Radius: 100.0, Start: calc.NewVec(-1.0, 0.0), End: calc.NewVec(0.0, -1.0)},
	PointCollider{Pos: north},
	LineCollider{Pos: north, Dir: south},
}

var CircleColliders []Collider = []Collider{
	CircleCollider{Pos: mid, Radius: 24.0},
}

type CollisionPoint struct {
	Point calc.Vector
	Type  models.StructureType
}

func GetCollisionPoints(structure models.Structure, pos calc.Vector, ball Ball) []CollisionPoint {
	colliders := GetColliders(structure.Type)
	var points []CollisionPoint = []CollisionPoint{}
	for _, collider := range colliders {
		point, err := collider.ProjectionPoint(pos, ball.Pos, structure.Rotation)
		if err == nil {
			points = append(points, CollisionPoint{Point: point, Type: structure.Type})
		}
	}
	return points
}

func GetColliders(structure_type models.StructureType) []Collider {
	switch structure_type {
	case models.Wall:
		return BoxColliders
	case models.Circle:
		return CircleColliders
	case models.Wedge:
		return WedgeColliders
	case models.RoundedCorner:
		return RoundedCornerColliders
	case models.InvertedRoundedCorner:
		return InvertedRoundedCornerColliders
	case models.Hole:
		return CircleColliders
	}
	return []Collider{}
}
