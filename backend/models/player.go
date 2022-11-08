package models

// Player
type PlayerDto struct {
	X         float64 `json:"x"`
	Y         float64 `json:"y"`
	Dx        float64 `json:"dx"`
	Dy        float64 `json:"dy"`
	Id        int64   `json:"id"`
	Name      string  `json:"name"`
	ShotCount int64   `json:"shotCount"`
}
