package routes

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

func HelloWorld(router *gin.Engine) {
	router.GET("/api", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"data": "Hello World!",
		})
	})

	router.GET("/api/:name", func(c *gin.Context) {
		name := c.Param("name")
		c.JSON(200, gin.H{
			"data": fmt.Sprintf("Hello %s!", name),
		})
	})
}
