package game

const TICK = 60

const SIZE_X = 49
const SIZE_Y = 25
const TILE_SIZE = 100.0
const BALL_SIZE = 40.0

const FRICTION = 0.983 // Previously 0.97
const GRAVEL_FRICTION = 0.8
const GRAVEL_HEAVY_FRICTION = 0.6
const SLOPE_GRAVITY = 0.75
const WALL_COLLISION_BOUNCE = 0.95

type SpecialEffect string

const (
	NoEffect        SpecialEffect = "NONE"
	HoleEffect      SpecialEffect = "HOLE"
	CollisionEffect SpecialEffect = "COLLISION"
	WaterEffect     SpecialEffect = "WATER"
)
