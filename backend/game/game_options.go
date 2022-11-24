package game

type GameOptions struct {
	BallSize  GameOption[float64]
	Friction  GameOption[float64]
	GameMode  GameOption[string]
	ScoreMode GameOption[string]
}

type LobbyOptions struct {
	MaxPlayers   GameOption[int64]
	PrivateGame  GameOption[bool]
	MapGenerator GameOption[string]
}

type GameOption[T string | float64 | int64 | bool] interface {
	GetValue() T
}

type GenericOption[T string | float64 | int64 | bool] struct {
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

func NewLobbyOptions() LobbyOptions {
	return LobbyOptions{
		MaxPlayers:   newIntOption("MAX PLAYERS", 10, 2, 100),
		PrivateGame:  newBoolOption("PRIVATE GAME", true),
		MapGenerator: newSelectOption("MAPS", "RANDOM", "HOLE IN ONE", ">4 SCORE", "LONG"),
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

type IntOption struct {
	GenericOption[int64]
	Min int64 `json:"min"`
	Max int64 `json:"max"`
}

func newIntOption(name string, value, min, max int64) IntOption {
	return IntOption{
		GenericOption[int64]{
			Type:  "INT_OPTION",
			Name:  name,
			Value: value,
		},
		min,
		max,
	}
}

type BoolOption struct {
	GenericOption[bool]
}

func newBoolOption(name string, value bool) BoolOption {
	return BoolOption{
		GenericOption[bool]{
			Type:  "BOOL_OPTION",
			Name:  name,
			Value: value,
		},
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
