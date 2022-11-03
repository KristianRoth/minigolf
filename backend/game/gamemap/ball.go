package game

type Ball struct {
	Pos VectorF64
	Vel VectorF64
}

func NewBall(pos VectorF64, vel VectorF64) Ball {
	return Ball{
		Pos: pos.Clone(),
		Vel: vel.Clone(),
	}
}

func (ball Ball) Clone() Ball {
	return NewBall(ball.Pos.Clone(), ball.Vel.Clone())
}
