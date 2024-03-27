package api

import "github.com/gin-gonic/gin"

func MakeRoutes() (*gin.Engine){
	r := gin.Default()

	r.GET("/show",ShowHandler)

	return r
}
