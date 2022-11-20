package game

type GameOptions struct {
	BallSize  GameOption[float64]
	Friction  GameOption[float64]
	GameMode  GameOption[string]
	ScoreMode GameOption[string]
}

type GameOption[T string | float64] interface {
	GetValue() T
}

type GenericOption[T string | float64] struct {
	Type  string `json:"type"`
	Name  string `json:"name"`
	Value T      `json:"value"`
}

func (g GenericOption[T]) GetValue() T {
	return g.Value
}

func NewGameOptions() GameOptions {
	return GameOptions{
		BallSize:  newFloatOption("BALL SIZE", 40, 5, 100),
		Friction:  newFloatOption("FRICTION", 100, 0, 200),
		GameMode:  newSelectOption("GAME MODE", "SAME TIME", "IN TURNS"),
		ScoreMode: newSelectOption("SCORE SYSTEM", "MAP WINS", "FEWEST SHOTS"),
	}
}

type FloatOption struct {
	GenericOption[float64]
	Min float64 `json:"min"`
	Max float64 `json:"max"`
}

func newFloatOption(name string, value, min, max float64) FloatOption {
	return FloatOption{
		GenericOption[float64]{
			Type:  "FLOAT_OPTION",
			Name:  name,
			Value: value,
		},
		min,
		max,
	}
}

type SelectOption struct {
	GenericOption[string]
	Options []string `json:"options"`
}

func newSelectOption(name string, options ...string) SelectOption {
	return SelectOption{
		GenericOption[string]{
			Type:  "SELECT_OPTION",
			Name:  name,
			Value: options[0],
		},
		options,
	}
}
