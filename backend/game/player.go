package game

type Player struct {
	name string
	ball Ball
}

func NewPlayer(name string) Player {
	return Player{
		name: name,
		ball: NewBall(),
	}
}

func (p Player) Update() {
	p.ball.x += p.ball.vx
	p.ball.y += p.ball.vy
}
