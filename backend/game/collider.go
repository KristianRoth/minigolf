package game

import (
	"backend/calc"
	"backend/models"
)

var mid = calc.NewVec(50.0, 50.0)

type collider interface {
	toTilePosition(tile GameMapTile) collider
	projectionPoint(ball_pos calc.Vector) (calc.Vector, error)
}

// Point
type pointCollider struct {
	Pos calc.Vector
}

func (pc pointCollider) toTilePosition(tile GameMapTile) collider {
	return pointCollider{
		Pos: pc.Pos.Rotate(mid, tile.Structure.Rotation).Add(tile.Pos),
	}
}

func (pc pointCollider) projectionPoint(ball_pos calc.Vector) (calc.Vector, error) {
	return pc.Pos, nil
}

// Circle
type circleCollider struct {
	Pos    calc.Vector
	Radius float64
}

func (cc circleCollider) toTilePosition(tile GameMapTile) collider {
	return circleCollider{
		Pos:    cc.Pos.Rotate(mid, tile.Structure.Rotation).Add(tile.Pos),
		Radius: cc.Radius,
	}
}

func (cc circleCollider) projectionPoint(ball_pos calc.Vector) (calc.Vector, error) {
	centre := cc.Pos
	dir := ball_pos.Subtract(centre).SetLength(cc.Radius)
	return centre.Add(dir), nil
}

// Line
type lineCollider struct {
	Pos calc.Vector
	Dir calc.Vector
}

func (lc lineCollider) toTilePosition(tile GameMapTile) collider {
	line := calc.NewLine(lc.Pos, lc.Dir).Rotate(mid, tile.Structure.Rotation).AddToPos(tile.Pos)
	return lineCollider{
		Pos: line.Pos,
		Dir: line.Dir,
	}
}

func (lc lineCollider) projectionPoint(ball_pos calc.Vector) (calc.Vector, error) {
	line := calc.NewLine(lc.Pos, lc.Dir)
	return line.ProjectPoint(ball_pos)
}

// Arc
type arcCollider struct {
	Pos      calc.Vector
	Start    calc.Vector
	End      calc.Vector
	Radius   float64
	Rotation models.Rotation
}

func (ac arcCollider) toTilePosition(tile GameMapTile) collider {
	arc := calc.NewArc(ac.Pos.Rotate(mid, tile.Structure.Rotation).Add(tile.Pos), ac.Radius, ac.Start, ac.End)
	return arcCollider{
		Pos:      arc.Pos,
		Start:    arc.Start,
		End:      arc.End,
		Radius:   ac.Radius,
		Rotation: tile.Structure.Rotation,
	}
}

func (ac arcCollider) projectionPoint(ball_pos calc.Vector) (calc.Vector, error) {
	arc := calc.NewArc(ac.Pos, ac.Radius, ac.Start, ac.End)
	return arc.ProjectPoint(ball_pos, ac.Rotation)
}

var boxColliders []collider = []collider{
	pointCollider{Pos: calc.NewVec(0, 0)},
	lineCollider{Pos: calc.NewVec(0, 0), Dir: calc.NewVec(100, 0)},
	pointCollider{Pos: calc.NewVec(100, 0)},
	lineCollider{Pos: calc.NewVec(100, 0), Dir: calc.NewVec(0, 100)},
	pointCollider{Pos: calc.NewVec(100, 100)},
	lineCollider{Pos: calc.NewVec(100, 100), Dir: calc.NewVec(-100, 0)},
	pointCollider{Pos: calc.NewVec(0, 100)},
	lineCollider{Pos: calc.NewVec(0, 100), Dir: calc.NewVec(0, -100)},
}

var wedgeColliders []collider = []collider{
	pointCollider{Pos: calc.NewVec(0, 0)},
	lineCollider{Pos: calc.NewVec(0, 0), Dir: calc.NewVec(100, 0)},
	pointCollider{Pos: calc.NewVec(100, 0)},
	lineCollider{Pos: calc.NewVec(100, 0), Dir: calc.NewVec(-100, 100)},
	pointCollider{Pos: calc.NewVec(0, 100)},
	lineCollider{Pos: calc.NewVec(0, 100), Dir: calc.NewVec(0, -100)},
}

var roundedCornerColliders []collider = []collider{
	pointCollider{Pos: calc.NewVec(0, 0)},
	lineCollider{Pos: calc.NewVec(0, 0), Dir: calc.NewVec(100, 0)},
	pointCollider{Pos: calc.NewVec(100, 0)},
	arcCollider{Pos: calc.NewVec(0, 0), Radius: 100, Start: calc.NewVec(1, 0), End: calc.NewVec(0, 1)},
	pointCollider{Pos: calc.NewVec(0, 100)},
	lineCollider{Pos: calc.NewVec(0, 100), Dir: calc.NewVec(0, -100)},
}

var invertedRoundedCornerColliders []collider = []collider{
	pointCollider{Pos: calc.NewVec(0, 0)},
	lineCollider{Pos: calc.NewVec(0, 0), Dir: calc.NewVec(100, 0)},
	pointCollider{Pos: calc.NewVec(100, 0)},
	arcCollider{Pos: calc.NewVec(100, 100), Radius: 100, Start: calc.NewVec(-1, 0), End: calc.NewVec(0, -1)},
	pointCollider{Pos: calc.NewVec(0, 100)},
	lineCollider{Pos: calc.NewVec(0, 100), Dir: calc.NewVec(0, -100)},
}

var circleColliders []collider = []collider{
	circleCollider{Pos: calc.NewVec(50, 50), Radius: 24},
}

func getBaseColliders(structure_type models.StructureType) []collider {
	switch structure_type {
	case models.Wall:
		return boxColliders
	case models.Circle:
		return circleColliders
	case models.Wedge:
		return wedgeColliders
	case models.RoundedCorner:
		return roundedCornerColliders
	case models.InvertedRoundedCorner:
		return invertedRoundedCornerColliders
	case models.Hole:
		return circleColliders
	}
	return []collider{}
}

type colliderMesh struct {
	colliders map[string][]collider
}

type collisionPoint struct {
	Point calc.Vector
	Type  models.StructureType
}

func newColliderMesh(gm GameMap) colliderMesh {
	mesh := colliderMesh{
		colliders: make(map[string][]collider),
	}
	for _, col := range gm.Tiles {
		for _, tile := range col {
			mesh.createColliders(tile)
		}
	}
	return mesh
}

// Converts base-colliders to correct rotations and positions.
func (cm *colliderMesh) createColliders(tile GameMapTile) {
	base_colliders := getBaseColliders(tile.Structure.Type)
	colliders := []collider{}
	for _, bc := range base_colliders {
		colliders = append(colliders, bc.toTilePosition(tile))
	}
	cm.colliders[tile.getId()] = colliders
}

func (cm *colliderMesh) getCollisionPoints(tile GameMapTile, ball Ball) []collisionPoint {
	colliders := cm.colliders[tile.getId()]
	var points []collisionPoint = []collisionPoint{}
	for _, collider := range colliders {
		point, err := collider.projectionPoint(ball.Pos)
		if err == nil {
			points = append(points, collisionPoint{Point: point, Type: tile.Structure.Type})
		}
	}
	return points
}
