package game

type Ball struct {
	x  float64
	y  float64
	vx float64
	vy float64
}

func NewBall() Ball {
	return Ball{
		x:  10,
		y:  10,
		vx: 10,
		vy: 10,
	}
}
