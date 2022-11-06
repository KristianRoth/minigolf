package game

import (
	"backend/calc"
	"backend/models"
	"strconv"
)

const SIZE_X = 49
const SIZE_Y = 25
const BALL_SIZE = 50.0

var next_id = 1

type GameMapTile struct {
	Pos       calc.Vector
	Ground    models.Ground
	Structure models.Structure
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
			tiles_col = append(
				tiles_col,
				GameMapTile{
					Pos:       calc.NewVec(float64(x)*100.0, float64(y)*100.0),
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

func GameToDto(gameMap GameMap) models.GameMapDto {
	var tile_dtos []models.TileDto = []models.TileDto{}
	for _, col := range gameMap.Tiles {
		for _, tile := range col {
			tile_dtos = append(tile_dtos, tileToDto(tile))
		}
	}
	return models.GameMapDto{
		Id:    gameMap.Id,
		Tiles: tile_dtos,
	}
}

func GameFromDto(gdto models.GameMapDto) GameMap {
	var tiles [][]GameMapTile = [][]GameMapTile{}
	for _, tile_dto := range gdto.Tiles {
		x := tile_dto.Pos.X / 100
		y := tile_dto.Pos.Y / 100
		tiles[int(x)][int(y)] = tileFromDto(tile_dto)
	}
	return GameMap{
		Id:    gdto.Id,
		Tiles: tiles,
	}
}