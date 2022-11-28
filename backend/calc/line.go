package calc

import (
	"backend/models"
	"errors"
)

type Line struct {
	Pos Vector
	Dir Vector
}

func NewLine(pos Vector, dir Vector) Line {
	return Line{
		Pos: pos.Clone(),
		Dir: dir.Clone(),
	}
}

func (line Line) ProjectPoint(point Vector) (Vector, error) {
	translatedPoint := point.Subtract(line.Pos)
	projectedVec := line.Dir.Project(translatedPoint)

	if projectedVec.Dot(line.Dir) > 0.0 && projectedVec.Length() < line.Dir.Length() {
		return projectedVec.Add(line.Pos), nil
	}
	return Vector{}, errors.New("cannot project point")
}

func (line Line) AddToPos(b Vector) Line {
	return NewLine(line.Pos.Add(b), line.Dir.Clone())
}

func (line Line) Rotate(mid Vector, rot models.Rotation) Line {
	return NewLine(line.Pos.Rotate(mid, rot), line.Dir.Rotate(NewVec(0.0, 0.0), rot))
}
