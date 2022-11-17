package game

import "backend/calc"

type Ball struct {
	Pos calc.Vector
	Vel calc.Vector
}

func newBall(pos calc.Vector, vel calc.Vector) Ball {
	return Ball{
		Pos: pos.Clone(),
		Vel: vel.Clone(),
	}
}

func (ball Ball) Clone() Ball {
	return newBall(ball.Pos.Clone(), ball.Vel.Clone())
}

func (ball Ball) Move(amount float64) Ball {
	pos := ball.Pos.Add(ball.Vel.Unit().Multiply(amount))
	return newBall(pos, ball.Vel)
}

func (ball Ball) Stop() Ball {
	vel := calc.NewVec(0, 0)
	return newBall(ball.Pos, vel)
}
