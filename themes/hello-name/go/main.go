package main

import (
	"flag"
	"fmt"
	"os"
)

func main() {
	name := flag.String("name", "", "Name to greet")
	flag.Parse()

	if *name == "" {
		fmt.Fprintln(os.Stderr, "Sorry, may I have your name?")
		os.Exit(1)
	}

	fmt.Printf("Hello, %s!\n", *name)
}
