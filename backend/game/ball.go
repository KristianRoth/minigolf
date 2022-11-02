package game

type Ball struct {
	x  float32
	y  float32
	vx float32
	vy float32
}

func NewBall() Ball {
	return Ball{
		x:  10,
		y:  10,
		vx: 10,
		vy: 10,
	}
}
