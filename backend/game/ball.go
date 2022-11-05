package game

import "backend/calc"

type Ball struct {
	Pos calc.Vector
	Vel calc.Vector
}

func NewBall(pos calc.Vector, vel calc.Vector) Ball {
	return Ball{
		Pos: pos.Clone(),
		Vel: vel.Clone(),
	}
}

func (ball Ball) Clone() Ball {
	return NewBall(ball.Pos.Clone(), ball.Vel.Clone())
}

func (ball Ball) Move(amount float64) Ball {
	pos := ball.Vel.Unit().Multiply(amount)
	return NewBall(pos, ball.Vel)
}
