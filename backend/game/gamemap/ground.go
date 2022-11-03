package game

type GroundType int64

const (
	Grass GroundType = iota
	Water
	Gravel
	GravelHeavy
	Slope
	SlopeDiagonal
)

type Ground struct {
	Rotation Rotation
	Type     GroundType
}

func (ground Ground) DoEffect(ball Ball, start VectorF64) Ball {
	switch ground.Type {
	case Grass:
		return ball.Clone()
	case Water:
		return NewBall(start, NewVec(0.0, 0.0))
	case Gravel:
		return NewBall(ball.Pos, ball.Vel.Multiply(0.8))
	case GravelHeavy:
		return NewBall(ball.Pos, ball.Vel.Multiply(0.5))
	case Slope:
		slope := NewVec(0.0, -1.0).Rotate(NewVec(0.0, 0.0), ground.Rotation)
		return NewBall(ball.Pos, ball.Vel.Add(slope))
	case SlopeDiagonal:
		slope := NewVec(-1.0, -1.0).Rotate(NewVec(0.0, 0.0), ground.Rotation)
		return NewBall(ball.Pos, ball.Vel.Add(slope))
	}
	return ball.Clone()
}
