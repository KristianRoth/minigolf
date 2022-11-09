package calc

import (
	"backend/models"
	"errors"
)

type Arc struct {
	Pos    Vector
	Radius float64
	Start  Vector
	End    Vector
}

func NewArc(pos Vector, radius float64, start Vector, end Vector) Arc {
	return Arc{
		pos,
		radius,
		start,
		end,
	}
}

func (arc Arc) ProjectPoint(ball Vector, rot models.Rotation) (Vector, error) {
	zero := NewVec(0.0, 0.0)
	dist_vector := ball.VectorTo(arc.Pos)
	dist_unit := dist_vector.Unit()
	closer := dist_unit.Multiply(-arc.Radius)

	rot_start := arc.Start.Rotate(zero, rot)
	rot_end := arc.End.Rotate(zero, rot)
	if closer.IsBetween(rot_start, rot_end) {
		return arc.Pos.Add(closer), nil
	}
	further := dist_unit.Multiply(arc.Radius)

	if further.IsBetween(rot_end, rot_start) {
		return arc.Pos.Add(further), nil
	}
	return Vector{}, errors.New("cannot project point")
}
