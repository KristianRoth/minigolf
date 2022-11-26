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
	distVector := ball.VectorTo(arc.Pos)
	distUnit := distVector.Unit()
	closer := distUnit.Multiply(-arc.Radius)

	rotStart := arc.Start.Rotate(zero, rot)
	rotEnd := arc.End.Rotate(zero, rot)
	if closer.IsBetween(rotStart, rotEnd) {
		return arc.Pos.Add(closer), nil
	}
	further := distUnit.Multiply(arc.Radius)

	if further.IsBetween(rotEnd, rotStart) {
		return arc.Pos.Add(further), nil
	}
	return Vector{}, errors.New("cannot project point")
}
