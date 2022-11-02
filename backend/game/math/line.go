package game

import (
	"errors"
	"fmt"
)

type Line struct {
	pos VectorF64
	dir VectorF64
}

func NewLine(pos VectorF64, dir VectorF64) Line {
	return Line{
		pos: pos.Clone(),
		dir: dir.Clone(),
	}
}

func (line *Line) ProjectPoint(point VectorF64) (VectorF64, error) {
	fmt.Println("TODO ProjectPOint")
	translated_point := point.Subtract(line.pos)
	projected_vec := line.dir.Project(translated_point)

	if projected_vec.Dot(line.dir) > 0.0 && projected_vec.Length() < line.dir.Length() {
		return projected_vec.Add(line.pos), nil
	}
	return NewVec(0, 0), errors.New("New")
}

func (line Line) AddToPos(b VectorF64) Line {
	return NewLine(line.pos.Add(b), line.dir.Clone())
}

func (line Line) Rotate(mid VectorF64, rot string) Line {
	return NewLine(line.pos.Rotate(mid, rot), line.dir.Rotate(NewVec(0.0, 0.0), rot))
}
