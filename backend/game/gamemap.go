package game

import (
	"backend/calc"
	"backend/models"
	"fmt"
	"strconv"
	"strings"
)

var next_id = 1

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

func tileFromString(tile_string string, pos calc.Vector) GameMapTile {
	var result []int
	for _, val := range strings.Split(tile_string, ",") {
		as_int, _ := strconv.Atoi(val)
		result = append(result, as_int)
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
	id := next_id
	next_id += 1

	for x := 0; x < SIZE_X; x += 1 {
		tiles_col := []GameMapTile{}
		for y := 0; y < SIZE_Y; y += 1 {
			is_border := x == 0 || y == 0 || x == SIZE_X-1 || y == SIZE_Y-1
			var structure_type models.StructureType = models.None
			if is_border {
				structure_type = models.Wall
			}
			if x == 1 && y == 1 {
				structure_type = models.Start
			}
			if x == SIZE_X-2 && y == SIZE_Y-2 {
				structure_type = models.Hole
			}
			tile := GameMapTile{
				Pos:       calc.NewVec(float64(x)*TILE_SIZE, float64(y)*TILE_SIZE),
				Ground:    models.Ground{Type: models.Grass, Rotation: models.North},
				Structure: models.Structure{Type: structure_type, Rotation: models.North},
			}
			tiles_col = append(tiles_col, tile)
		}
		tiles = append(tiles, tiles_col)
	}
	return GameMap{
		Id:    strconv.Itoa(id),
		Tiles: tiles,
	}
}

func GameMapToDto(gameMap GameMap) models.GameMapDto {
	var tile_dtos [][]string
	for _, col := range gameMap.Tiles {
		new_col := []string{}
		for _, tile := range col {
			new_col = append(new_col, tileToString(tile))
		}
		tile_dtos = append(tile_dtos, new_col)
	}
	return models.GameMapDto{
		Id:    gameMap.Id,
		Tiles: tile_dtos,
		Stats: gameMap.Stats,
	}
}

func GameMapFromDto(gdto models.GameMapDto) GameMap {
	tiles := [][]GameMapTile{}

	for i, col_tiles := range gdto.Tiles {
		col := []GameMapTile{}
		for j, tile_str := range col_tiles {
			tile := tileFromString(tile_str, calc.NewVec(float64(i*TILE_SIZE), float64(j*TILE_SIZE)))
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
