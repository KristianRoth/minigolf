package calc

import (
	"backend/models"
	"math"
)

type Vector struct {
	X float64
	Y float64
}

func NewVec(x float64, y float64) Vector {
	return Vector{
		x,
		y,
	}
}

func (a Vector) Clone() Vector {
	return NewVec(a.X, a.Y)
}

func (a Vector) Add(b Vector) Vector {
	return NewVec(a.X+b.X, a.Y+b.Y)
}

func (a Vector) Subtract(b Vector) Vector {
	return NewVec(a.X-b.X, a.Y-b.Y)
}

func (a Vector) Multiply(c float64) Vector {
	return NewVec(a.X*c, a.Y*c)
}

func (a Vector) Length() float64 {
	return math.Sqrt(math.Pow(a.X, 2) + math.Pow(a.Y, 2))
}

func (a Vector) Dot(b Vector) float64 {
	return a.X*b.X + a.Y*b.Y
}

func (a Vector) Normal() Vector {
	return NewVec(-a.Y, a.X)
}

func (a Vector) Unit() Vector {
	return a.Multiply(1.0 / a.Length())
}

func (a Vector) Project(b Vector) Vector {
	dot := a.Dot(b)
	unit_fac := dot / a.Dot(a)
	return a.Multiply(unit_fac)
}

func (a Vector) Distance(b Vector) float64 {
	sub := a.Subtract(b)
	return sub.Length()
}

func (a Vector) NormalBase(newVec_base Vector) Vector {
	normal := newVec_base.Normal()
	// | newVec_base.x, normal.x | x | self.x | = | newVec_base.x*self.x + normal.x*self.y |
	// | newVec_base.y, normal.y |   | self.y |   | newVec_base.y*self.x + normal.y*self.y |
	x := a.X*newVec_base.X + a.Y*normal.X
	y := a.X*newVec_base.Y + a.Y*normal.Y
	return NewVec(x, y)
}

func (a Vector) ChangeBase(newVec_base Vector) Vector {
	normal := newVec_base.Normal()
	scale := 1.0 / (normal.Y*newVec_base.X - normal.X*newVec_base.Y)

	base := newVec_base.Multiply(scale)
	normal = normal.Multiply(scale)

	// |    normal.y,  -normal.x | x | self.x | = | newVec_base.x*self.x + normal.x*self.y |
	// | -newVec_base.y, newVec_base.x |   | self.y |   | newVec_base.y*self.x + normal.y*self.y |
	//                .multi(1/(normal.y*newVec_base.x - normal.x*newVec_base.y))
	x := a.X*normal.Y - a.Y*normal.X
	y := -a.X*base.Y + a.Y*base.X
	return NewVec(x, y)
}

func (a Vector) Rotate(mid Vector, rot models.Rotation) Vector {
	switch rot {
	case models.North:
		return a.Clone()
	case models.East:
		return a.Subtract(mid).NormalBase(NewVec(0.0, 1.0)).Add(mid)
	case models.South:
		return a.Subtract(mid).NormalBase(NewVec(-1.0, 0.0)).Add(mid)
	case models.West:
		return a.Subtract(mid).NormalBase(NewVec(0.0, -1.0)).Add(mid)
	}
	return a.Clone()
}

func (a Vector) Angle() float64 {
	up := NewVec(0.0, 1.0)
	c := a.Dot(up) / (up.Length() * a.Length())
	return math.Acos(c)
}

func (a Vector) VectorTo(to Vector) Vector {
	return to.Subtract(a)
}

func (a Vector) CrossZ(b Vector) float64 {
	return a.Y*b.X - a.X*b.Y
}

func (a Vector) IsBetween(b Vector, c Vector) bool {
	return b.CrossZ(a)*b.CrossZ(c) >= 0.0 && c.CrossZ(a)*c.CrossZ(b) >= 0.0
}
