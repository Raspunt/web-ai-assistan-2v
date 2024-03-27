package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ShowHandler(c *gin.Context) {
	req := c.Request
	req.ParseForm()
	r := req.Form
	for k, v := range r {
		fmt.Println(fmt.Sprintf("%s=%v", k, v))
	}

	c.JSON(http.StatusOK, gin.H{
		"success": "very goooooood",
	})
}
