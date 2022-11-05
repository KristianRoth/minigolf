package models

// Point
type Point struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type Structure struct {
	Rotation Rotation      `json:"rotation"`
	Type     StructureType `json:"type"`
}

type Ground struct {
	Rotation Rotation   `json:"rotation"`
	Type     GroundType `json:"type"`
}

// Tile
type Tile struct {
	Pos       Point     `json:"pos"`
	Ground    Ground    `json:"ground"`
	Structure Structure `json:"structure"`
}

// GameMap
type GameMap struct {
	Id    string   `json:"id"`
	Tiles [][]Tile `json:"tiles"`
}
