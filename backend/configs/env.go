package configs

import (
	"os"
)

func EnvTest() string {
	return os.Getenv("TEST")
}
