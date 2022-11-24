package main

import (
	"backend/communications"
	"backend/configs"
	"backend/routes"
	"fmt"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
)

func main() {
	testEnvVariable := configs.EnvTest()
	fmt.Printf("TEST-ENV-VAR: %s\n\n", testEnvVariable)

	gameH := communications.NewGameHandler()

	router := gin.Default()
	router.Use(gzip.Gzip(gzip.DefaultCompression))
	router.Use(cors.Default()) // TODO: This allows all origins.

	routes.GameRoutes(router, &gameH)
	routes.FrontendFiles(router)

	router.Run("0.0.0.0:8080")
}
