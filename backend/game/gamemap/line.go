package game

import (
	"errors"
	"fmt"
)

type Line struct {
	Pos VectorF64
	Dir VectorF64
}

func NewLine(pos VectorF64, dir VectorF64) Line {
	return Line{
		Pos: pos.Clone(),
		Dir: dir.Clone(),
	}
}

func (line Line) ProjectPoint(point VectorF64) (VectorF64, error) {
	fmt.Println("TODO ProjectPOint")
	translated_point := point.Subtract(line.Pos)
	projected_vec := line.Dir.Project(translated_point)

	if projected_vec.Dot(line.Dir) > 0.0 && projected_vec.Length() < line.Dir.Length() {
		return projected_vec.Add(line.Pos), nil
	}
	return VectorF64{}, errors.New("cannot project point")
}

func (line Line) AddToPos(b VectorF64) Line {
	return NewLine(line.Pos.Add(b), line.Dir.Clone())
}

func (line Line) Rotate(mid VectorF64, rot Rotation) Line {
	return NewLine(line.Pos.Rotate(mid, rot), line.Dir.Rotate(NewVec(0.0, 0.0), rot))
}
