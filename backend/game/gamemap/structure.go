package game

import "fmt"

type StructureType int64

const (
	Wall StructureType = iota
	Circle
	Start
	Hole
	Wedge
	RoundedCorner
	InvertedRoundedCorner
	None
)

type SpecialEffect int64

const (
	HoleEffect SpecialEffect = iota
)

type Structure struct {
	Rotation Rotation
	Type     StructureType
}

func (structure Structure) GetPointsRot(pos VectorF64, ball Ball, rot Rotation, colliders []Collider) []VectorF64 {
	var points []VectorF64 = []VectorF64{}
	for _, collider := range colliders {
		point, err := collider.ProjectionPoint(pos, ball.Pos, rot)
		if err == nil {
			points = append(points, point)
		}
	}
	return points
}

func (structure Structure) GetPoints(pos VectorF64, ball Ball, colliders []Collider) []VectorF64 {
	return structure.GetPointsRot(pos, ball, North, colliders)
}

func (structure Structure) GetCollisionPoints(pos VectorF64, ball Ball) []VectorF64 {
	switch structure.Type {
	case Wall:
		return structure.GetPoints(pos, ball, BoxColliders)
	case Circle:
		return structure.GetPoints(pos, ball, CircleColliders)
	case Wedge:
		return structure.GetPointsRot(pos, ball, structure.Rotation, WedgeColliders)
	case RoundedCorner:
		return structure.GetPointsRot(pos, ball, structure.Rotation, RoundedCornerColliders)
	case InvertedRoundedCorner:
		return structure.GetPointsRot(pos, ball, structure.Rotation, InvertedRoundedCornerColliders)
	}
	return []VectorF64{}
}

func (structure Structure) GetEffectPoints(pos VectorF64, ball Ball) []VectorF64 {
	fmt.Println("TODO GetEffectPoints")
	return []VectorF64{}
}

func (structure Structure) GetEffect(pos VectorF64, ball Ball) []VectorF64 {
	fmt.Println("TODO GetEffectPoints")
	return []VectorF64{}
}
