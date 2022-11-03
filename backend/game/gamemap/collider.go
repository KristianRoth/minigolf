package game

var mid = NewVec(50.0, 50.0)

type Collider interface {
	ProjectionPoint(position VectorF64, ball VectorF64, rot Rotation) (VectorF64, error)
}

// Point
type PointCollider struct {
	Pos VectorF64
}

func (pc PointCollider) ProjectionPoint(position VectorF64, ball VectorF64, rot Rotation) (VectorF64, error) {
	return pc.Pos.Rotate(mid, rot).Add(position), nil
}

// Circle
type CircleCollider struct {
	Pos    VectorF64
	Radius float64
}

func (cc CircleCollider) ProjectionPoint(position VectorF64, ball VectorF64, rot Rotation) (VectorF64, error) {
	centre := cc.Pos.Rotate(mid, rot).Add(position)
	dir := ball.Subtract(centre).Unit().Multiply(cc.Radius)
	return centre.Add(dir), nil
}

// Line
type LineCollider struct {
	Pos VectorF64
	Dir VectorF64
}

func (lc LineCollider) ProjectionPoint(position VectorF64, ball VectorF64, rot Rotation) (VectorF64, error) {
	return NewLine(lc.Pos, lc.Dir).Rotate(mid, rot).AddToPos(position).ProjectPoint(ball)
}

// Arc
type ArcCollider struct {
	Pos    VectorF64
	Start  VectorF64
	End    VectorF64
	Radius float64
}

func (ac ArcCollider) ProjectionPoint(position VectorF64, ball VectorF64, rot Rotation) (VectorF64, error) {
	return NewArc(ac.Pos, ac.Radius, ac.Start, ac.End).ProjectPoint(ball, rot)
}

var origin = NewVec(0.0, 0.0)
var north = NewVec(100.0, 0.0)
var northeast = NewVec(100.0, 100.0)
var east = NewVec(0.0, 100.0)

// var southeast = NewVec(-100.0, 100.0)
var south = NewVec(0.0, -100.0)

// var southwest = NewVec(-100.0, -100.0)
var west = NewVec(-100.0, 0)
var northwest = NewVec(-100.0, 100.0)

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
	ArcCollider{Pos: origin, Radius: 100.0, Start: NewVec(1.0, 0.0), End: NewVec(0.0, 1.0)},
	PointCollider{Pos: north},
	LineCollider{Pos: north, Dir: south},
}

var InvertedRoundedCornerColliders []Collider = []Collider{
	PointCollider{Pos: origin},
	LineCollider{Pos: origin, Dir: east},
	PointCollider{Pos: east},
	ArcCollider{Pos: northeast, Radius: 100.0, Start: NewVec(-1.0, 0.0), End: NewVec(0.0, -1.0)},
	PointCollider{Pos: north},
	LineCollider{Pos: north, Dir: south},
}

var CircleColliders []Collider = []Collider{
	CircleCollider{Pos: mid, Radius: 24.0},
}
