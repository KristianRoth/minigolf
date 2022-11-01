package main

import (
	"backend/configs"
	"backend/routes"
	"fmt"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	testEnvVariable := configs.EnvTest()
	fmt.Printf("TEST-ENV-VAR: %s\n\n", testEnvVariable)

	router := gin.Default()
	router.Use(cors.Default()) // TODO: This allows all origins.

	routes.HelloWorld(router)
	routes.WebSocket(router)
	routes.FrontendFiles(router)

	router.Run("localhost:8080")
}
