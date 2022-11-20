package game

import (
	"backend/calc"
	"backend/models"
	"fmt"
	"strconv"
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

func tileToDto(gmt GameMapTile) models.TileDto {
	return models.TileDto{
		Pos: models.Point{
			X: gmt.Pos.X,
			Y: gmt.Pos.Y,
		},
		Ground:    gmt.Ground,
		Structure: gmt.Structure,
	}
}

func tileFromDto(tdto models.TileDto) GameMapTile {
	return GameMapTile{
		Pos: calc.Vector{
			X: tdto.Pos.X,
			Y: tdto.Pos.Y,
		},
		Ground:    tdto.Ground,
		Structure: tdto.Structure,
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
			tiles_col = append(
				tiles_col,
				GameMapTile{
					Pos:       calc.NewVec(float64(x)*TILE_SIZE, float64(y)*TILE_SIZE),
					Ground:    models.Ground{Type: models.Grass, Rotation: models.North},
					Structure: models.Structure{Type: structure_type, Rotation: models.North},
				})
		}
		tiles = append(tiles, tiles_col)
	}
	return GameMap{
		Id:    strconv.Itoa(id),
		Tiles: tiles,
	}
}

func GameMapToDto(gameMap GameMap) models.GameMapDto {
	var tile_dtos []models.TileDto = []models.TileDto{}
	for _, col := range gameMap.Tiles {
		for _, tile := range col {
			tile_dtos = append(tile_dtos, tileToDto(tile))
		}
	}
	return models.GameMapDto{
		Id:    gameMap.Id,
		Tiles: tile_dtos,
		Stats: gameMap.Stats,
	}
}

func GameMapFromDto(gdto models.GameMapDto) GameMap {
	tiles := make([][]GameMapTile, SIZE_X)
	for x := 0; x < SIZE_X; x += 1 {
		tiles[x] = make([]GameMapTile, SIZE_Y)
	}

	for _, tile_dto := range gdto.Tiles {
		x := tile_dto.Pos.X / TILE_SIZE
		y := tile_dto.Pos.Y / TILE_SIZE
		tiles[int(x)][int(y)] = tileFromDto(tile_dto)
	}
	return GameMap{
		Id:    gdto.Id,
		Tiles: tiles,
		Stats: gdto.Stats,
	}
}
