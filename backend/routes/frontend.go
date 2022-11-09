package routes

import (
	"strings"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

func FrontendFiles(router *gin.Engine) {
	fs := static.LocalFile("../frontend/build", false)

	// Add middleware for static files.
	router.Use(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.RequestURI, "/static") && fs.Exists("/", c.Request.URL.Path) {
			c.Header("Cache-Control", "max-age=31536000")
		}
	})

	router.Use(static.Serve("/", fs))

	router.NoRoute(func(c *gin.Context) {
		if !strings.HasPrefix(c.Request.RequestURI, "/api") {
			c.File("../frontend/build/index.html")
		}
		//default 404 page not found
	})
}
