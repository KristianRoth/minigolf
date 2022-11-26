package game

import (
	"backend/calc"
	"backend/models"
)

var mid = calc.NewVec(TILE_SIZE/2, TILE_SIZE/2)

type collider interface {
	toTilePosition(tile GameMapTile) collider
	projectionPoint(ballPos calc.Vector) (calc.Vector, error)
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

func (pc pointCollider) projectionPoint(ballPos calc.Vector) (calc.Vector, error) {
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

func (cc circleCollider) projectionPoint(ballPos calc.Vector) (calc.Vector, error) {
	centre := cc.Pos
	dir := ballPos.Subtract(centre).SetLength(cc.Radius)
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

func (lc lineCollider) projectionPoint(ballPos calc.Vector) (calc.Vector, error) {
	line := calc.NewLine(lc.Pos, lc.Dir)
	return line.ProjectPoint(ballPos)
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

func (ac arcCollider) projectionPoint(ballPos calc.Vector) (calc.Vector, error) {
	arc := calc.NewArc(ac.Pos, ac.Radius, ac.Start, ac.End)
	return arc.ProjectPoint(ballPos, ac.Rotation)
}

var boxColliders []collider = []collider{
	pointCollider{Pos: calc.NewVec(0, 0)},
	lineCollider{Pos: calc.NewVec(0, 0), Dir: calc.NewVec(TILE_SIZE, 0)},
	pointCollider{Pos: calc.NewVec(TILE_SIZE, 0)},
	lineCollider{Pos: calc.NewVec(TILE_SIZE, 0), Dir: calc.NewVec(0, TILE_SIZE)},
	pointCollider{Pos: calc.NewVec(TILE_SIZE, TILE_SIZE)},
	lineCollider{Pos: calc.NewVec(TILE_SIZE, TILE_SIZE), Dir: calc.NewVec(-TILE_SIZE, 0)},
	pointCollider{Pos: calc.NewVec(0, TILE_SIZE)},
	lineCollider{Pos: calc.NewVec(0, TILE_SIZE), Dir: calc.NewVec(0, -TILE_SIZE)},
}

var wedgeColliders []collider = []collider{
	pointCollider{Pos: calc.NewVec(0, 0)},
	lineCollider{Pos: calc.NewVec(0, 0), Dir: calc.NewVec(TILE_SIZE, 0)},
	pointCollider{Pos: calc.NewVec(TILE_SIZE, 0)},
	lineCollider{Pos: calc.NewVec(TILE_SIZE, 0), Dir: calc.NewVec(-TILE_SIZE, TILE_SIZE)},
	pointCollider{Pos: calc.NewVec(0, TILE_SIZE)},
	lineCollider{Pos: calc.NewVec(0, TILE_SIZE), Dir: calc.NewVec(0, -TILE_SIZE)},
}

var roundedCornerColliders []collider = []collider{
	pointCollider{Pos: calc.NewVec(0, 0)},
	lineCollider{Pos: calc.NewVec(0, 0), Dir: calc.NewVec(TILE_SIZE, 0)},
	pointCollider{Pos: calc.NewVec(TILE_SIZE, 0)},
	arcCollider{Pos: calc.NewVec(0, 0), Radius: TILE_SIZE, Start: calc.NewVec(1, 0), End: calc.NewVec(0, 1)},
	pointCollider{Pos: calc.NewVec(0, TILE_SIZE)},
	lineCollider{Pos: calc.NewVec(0, TILE_SIZE), Dir: calc.NewVec(0, -TILE_SIZE)},
}

var invertedRoundedCornerColliders []collider = []collider{
	pointCollider{Pos: calc.NewVec(0, 0)},
	lineCollider{Pos: calc.NewVec(0, 0), Dir: calc.NewVec(TILE_SIZE, 0)},
	pointCollider{Pos: calc.NewVec(TILE_SIZE, 0)},
	arcCollider{Pos: calc.NewVec(TILE_SIZE, TILE_SIZE), Radius: TILE_SIZE, Start: calc.NewVec(-1, 0), End: calc.NewVec(0, -1)},
	pointCollider{Pos: calc.NewVec(0, TILE_SIZE)},
	lineCollider{Pos: calc.NewVec(0, TILE_SIZE), Dir: calc.NewVec(0, -TILE_SIZE)},
}

var circleColliders []collider = []collider{
	circleCollider{Pos: calc.NewVec(50, 50), Radius: 24},
}

func getBaseColliders(structureType models.StructureType) []collider {
	switch structureType {
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
	baseColliders := getBaseColliders(tile.Structure.Type)
	colliders := []collider{}
	for _, bc := range baseColliders {
		colliders = append(colliders, bc.toTilePosition(tile))
	}

	// Add borders to the map.
	// TODO: Looks ugly.
	x := uint32(tile.Pos.X / TILE_SIZE)
	y := uint32(tile.Pos.Y / TILE_SIZE)
	if x == 0 {
		collider := lineCollider{Pos: tile.Pos, Dir: calc.NewVec(0, TILE_SIZE)}
		colliders = append(colliders, collider)
	} else if x == SIZE_X-1 {
		collider := lineCollider{Pos: calc.NewVec(tile.Pos.X+TILE_SIZE, tile.Pos.Y), Dir: calc.NewVec(0, TILE_SIZE)}
		colliders = append(colliders, collider)
	}
	if y == 0 {
		collider := lineCollider{Pos: tile.Pos, Dir: calc.NewVec(TILE_SIZE, 0)}
		colliders = append(colliders, collider)
	} else if y == SIZE_Y-1 {
		collider := lineCollider{Pos: calc.NewVec(tile.Pos.X, tile.Pos.Y+TILE_SIZE), Dir: calc.NewVec(TILE_SIZE, 0)}
		colliders = append(colliders, collider)
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
