package game

import (
	"backend/calc"
	"backend/models"
	"fmt"
	"strconv"
	"strings"
)

var nextId = 1

type GameMapTile struct {
	Pos       calc.Vector
	Ground    models.Ground
	Structure models.Structure
}

func (gmt GameMapTile) getId() string {
	return fmt.Sprintf("%f_%f", gmt.Pos.X, gmt.Pos.Y)
}

func tileToString(tile GameMapTile) string {
	return fmt.Sprintf("%d,%d,%d,%d", tile.Ground.Type, tile.Ground.Rotation, tile.Structure.Type, tile.Structure.Rotation)
}

// TODO: Add validation.
func tileFromString(tileString string, pos calc.Vector) GameMapTile {
	var result []int
	for _, val := range strings.Split(tileString, ",") {
		asInt, _ := strconv.Atoi(val)
		result = append(result, asInt)
	}
	return GameMapTile{
		Pos: pos,
		Ground: models.Ground{
			Type:     models.GroundType(result[0]),
			Rotation: models.Rotation(result[1]),
		},
		Structure: models.Structure{
			Type:     models.StructureType(result[2]),
			Rotation: models.Rotation(result[3]),
		},
	}
}

type GameMap struct {
	Id    string
	Tiles [][]GameMapTile
	Stats models.Stats
}

func NewGameMap() GameMap {
	tiles := [][]GameMapTile{}
	id := nextId
	nextId += 1

	for x := 0; x < SIZE_X; x += 1 {
		tilesCol := []GameMapTile{}
		for y := 0; y < SIZE_Y; y += 1 {
			isBorder := x == 0 || y == 0 || x == SIZE_X-1 || y == SIZE_Y-1
			var structureType models.StructureType = models.None
			if isBorder {
				structureType = models.Wall
			}
			if x == 1 && y == 1 {
				structureType = models.Start
			}
			if x == SIZE_X-2 && y == SIZE_Y-2 {
				structureType = models.Hole
			}
			tile := GameMapTile{
				Pos:       calc.NewVec(float64(x)*TILE_SIZE, float64(y)*TILE_SIZE),
				Ground:    models.Ground{Type: models.Grass, Rotation: models.North},
				Structure: models.Structure{Type: structureType, Rotation: models.North},
			}
			tilesCol = append(tilesCol, tile)
		}
		tiles = append(tiles, tilesCol)
	}
	return GameMap{
		Id:    strconv.Itoa(id),
		Tiles: tiles,
	}
}

func GameMapToDto(gameMap GameMap) models.GameMapDto {
	var tileDtos [][]string
	for _, col := range gameMap.Tiles {
		newCol := []string{}
		for _, tile := range col {
			newCol = append(newCol, tileToString(tile))
		}
		tileDtos = append(tileDtos, newCol)
	}
	return models.GameMapDto{
		Id:    gameMap.Id,
		Tiles: tileDtos,
		Stats: gameMap.Stats,
	}
}

func GameMapFromDto(gdto models.GameMapDto) GameMap {
	tiles := [][]GameMapTile{}

	for i, colTiles := range gdto.Tiles {
		col := []GameMapTile{}
		for j, tileStr := range colTiles {
			tile := tileFromString(tileStr, calc.NewVec(float64(i*TILE_SIZE), float64(j*TILE_SIZE)))
			col = append(col, tile)
		}
		tiles = append(tiles, col)
	}

	return GameMap{
		Id:    gdto.Id,
		Tiles: tiles,
		Stats: gdto.Stats,
	}
}
