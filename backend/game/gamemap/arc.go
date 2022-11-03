package game

import "errors"

type Arc struct {
	Pos    VectorF64
	Radius float64
	Start  VectorF64
	End    VectorF64
}

func NewArc(pos VectorF64, radius float64, start VectorF64, end VectorF64) Arc {
	return Arc{
		pos,
		radius,
		start,
		end,
	}
}

func (arc Arc) ProjectPoint(ball VectorF64, rot Rotation) (VectorF64, error) {
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
	return VectorF64{}, errors.New("cannot project point")
}
