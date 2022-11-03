package game

import "math"

type Rotation int64

const (
	North Rotation = iota
	East
	South
	West
)

func (rot Rotation) GetAngle() float64 {
	switch rot {
	case North:
		return 0.0
	case East:
		return math.Pi / 2.0
	case South:
		return math.Pi
	case West:
		return -math.Pi / 2.0
	}
	return 0.0
}
