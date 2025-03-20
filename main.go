package main

import (
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func initDatabase() {
	var err error
	db, err = gorm.Open(sqlite.Open("chat.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	db.AutoMigrate(&User{})
}

func main() {
	r := gin.Default()
	initDatabase()

	r.POST("/register", register)
	r.POST("/login", login)
	r.GET("/users", getUsers)
	r.GET("/ws", handleConnections)

	go handleMessages()

	r.Run(":8080")
}
