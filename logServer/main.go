package main

import "logServer/api"

func main() {
	ginServer := api.MakeRoutes()
	ginServer.Run(":4040")
}
