package main

import (
	"context"
	"log"

	"github.com/jmorganca/ollama/cmd"
	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	cobra.CheckErr(cmd.NewCLI().ExecuteContext(context.Background()))
}
