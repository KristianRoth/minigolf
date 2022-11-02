package game

import (
	"fmt"
	"math"
)

type VectorF64 struct {
	x float64
	y float64
}

func NewVec(x float64, y float64) VectorF64 {
	return VectorF64{
		x,
		y,
	}
}

func (a VectorF64) Clone() VectorF64 {
	return NewVec(a.x, a.y)
}

func (a VectorF64) Add(b VectorF64) VectorF64 {
	return NewVec(a.x+b.x, a.y+b.y)
}

func (a VectorF64) Subtract(b VectorF64) VectorF64 {
	return NewVec(a.x-b.x, a.y-b.y)
}

func (a VectorF64) Multiply(c float64) VectorF64 {
	return NewVec(a.x*c, a.y*c)
}

func (a VectorF64) Length() float64 {
	return math.Sqrt(math.Pow(a.x, 2) + math.Pow(a.y, 2))
}

func (a VectorF64) Dot(b VectorF64) float64 {
	return a.x*b.x + a.y*b.y
}

func (a VectorF64) Normal() VectorF64 {
	return NewVec(-a.y, a.x)
}

func (a VectorF64) Unit() VectorF64 {
	return a.Multiply(1.0 / a.Length())
}

func (a VectorF64) Project(b VectorF64) VectorF64 {
	dot := a.Dot(b)
	unit_fac := dot / a.Dot(a)
	return a.Multiply(unit_fac)
}

func (a VectorF64) Distance(b VectorF64) float64 {
	sub := a.Subtract(b)
	return sub.Length()
}

func (a VectorF64) NormalBase(newVec_base VectorF64) VectorF64 {
	normal := newVec_base.Normal()
	// | newVec_base.x, normal.x | x | self.x | = | newVec_base.x*self.x + normal.x*self.y |
	// | newVec_base.y, normal.y |   | self.y |   | newVec_base.y*self.x + normal.y*self.y |
	x := a.x*newVec_base.x + a.y*normal.x
	y := a.x*newVec_base.y + a.y*normal.y
	return NewVec(x, y)
}

func (a VectorF64) ChangeBase(newVec_base VectorF64) VectorF64 {
	normal := newVec_base.Normal()
	scale := 1.0 / (normal.y*newVec_base.x - normal.x*newVec_base.y)

	base := newVec_base.Multiply(scale)
	normal = normal.Multiply(scale)

	// |    normal.y,  -normal.x | x | self.x | = | newVec_base.x*self.x + normal.x*self.y |
	// | -newVec_base.y, newVec_base.x |   | self.y |   | newVec_base.y*self.x + normal.y*self.y |
	//                .multi(1/(normal.y*newVec_base.x - normal.x*newVec_base.y))
	x := a.x*normal.y - a.y - normal.x
	y := -a.x*base.y + a.y*base.x
	return NewVec(x, y)
}

func (a VectorF64) Rotate(mid VectorF64, rot string) VectorF64 {
	fmt.Println("TODO: VECTOR ROTATION")
	//		pub fn rotate(&self, mid: &VectorF64, rot: &Rotation) -> VectorF64 {
	//			match rot {
	//					Rotation::North => self.clone(),
	//					Rotation::East =>  self.sub(mid).change_to_normal_base(&VectorF64::newVec(0.0, 1.0)).add(mid),
	//					Rotation::South => self.sub(mid).change_to_normal_base(&VectorF64::newVec(-1.0, 0.0)).add(mid),
	//					Rotation::West =>  self.sub(mid).change_to_normal_base(&VectorF64::newVec(0.0, -1.0)).add(mid),
	//			}
	//	}
	return a.Clone()
}

func (a VectorF64) Angle() float64 {
	up := NewVec(0.0, 1.0)
	c := a.Dot(up) / (up.Length() * a.Length())
	return math.Acos(c)
}

func (a VectorF64) VectorTo(to VectorF64) VectorF64 {
	return to.Subtract(a)
}

func (a VectorF64) CrossZ(b VectorF64) float64 {
	return a.y*b.x - a.x*b.y
}

func (a VectorF64) IsBetween(b VectorF64, c VectorF64) bool {
	return b.CrossZ(a)*b.CrossZ(c) >= 0.0 && c.CrossZ(a)*c.CrossZ(b) >= 0.0
}
