package models

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
)

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
type TileDto struct {
	Pos       Point     `json:"pos"`
	Ground    Ground    `json:"ground"`
	Structure Structure `json:"structure"`
}

type Stats struct {
	Sum   int64 `json:"sum"`
	Count int64 `json:"count"`
}

// GameMap
type GameMapDto struct {
	Id    string    `json:"id"`
	Tiles []TileDto `json:"tiles"`
	Stats Stats     `json:"stats"`
}

// This could be used to determine whether a map with the same content already exists.
func (gm GameMapDto) Hash() string {
	str, _ := json.Marshal(gm.Tiles)
	hash := md5.Sum(str)
	return hex.EncodeToString(hash[:])
}
