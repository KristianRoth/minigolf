package models

import (
	"bytes"
	"encoding/json"
)

func reverseMap[T GroundType | StructureType | Rotation, U string](m map[T]U) map[U]T {
	n := make(map[U]T, len(m))
	for k, v := range m {
		n[v] = k
	}
	return n
}

func toJson[T GroundType | StructureType | Rotation](s T, toString map[T]string) ([]byte, error) {
	buffer := bytes.NewBufferString(`"`)
	buffer.WriteString(toString[s])
	buffer.WriteString(`"`)
	return buffer.Bytes(), nil
}

func toId[T GroundType | StructureType | Rotation](s *T, b []byte, toId map[string]T) error {
	var j string
	err := json.Unmarshal(b, &j)
	if err != nil {
		return err
	}
	// Note that if the string cannot be found then it will be set to the zero value.
	*s = toId[j]
	return nil
}

// GroundType
type GroundType int64

const (
	Grass GroundType = iota
	Water
	Gravel
	GravelHeavy
	Slope
	SlopeDiagonal
)

var gtToString = map[GroundType]string{
	Grass:         "Grass",
	Water:         "Water",
	Gravel:        "Gravel",
	GravelHeavy:   "GravelHeavy",
	Slope:         "Slope",
	SlopeDiagonal: "SlopeDiagonal",
}

var gtToId = reverseMap(gtToString)

func (gt GroundType) String() string {
	return gtToString[gt]
}

func (gt *GroundType) UnmarshalJSON(b []byte) error {
	return toId(gt, b, gtToId)
}

// StructureType
type StructureType int64

const (
	None StructureType = iota
	Wall
	Circle
	Start
	Hole
	Wedge
	RoundedCorner
	InvertedRoundedCorner
)

var stToString = map[StructureType]string{
	Wall:                  "Wall",
	Circle:                "Circle",
	Start:                 "Start",
	Hole:                  "Hole",
	Wedge:                 "Wedge",
	RoundedCorner:         "RoundedCorner",
	InvertedRoundedCorner: "InvertedRoundedCorner",
	None:                  "None",
}

var stToId = reverseMap(stToString)

func (st StructureType) String() string {
	return stToString[st]
}

func (st *StructureType) UnmarshalJSON(b []byte) error {
	return toId(st, b, stToId)
}

// Rotation
type Rotation int64

const (
	North Rotation = iota
	East
	South
	West
)

var rToString = map[Rotation]string{
	North: "North",
	East:  "East",
	South: "South",
	West:  "West",
}

var rToId = reverseMap(rToString)

func (r Rotation) String() string {
	return rToString[r]
}

func (r *Rotation) UnmarshalJSON(b []byte) error {
	return toId(r, b, rToId)
}
