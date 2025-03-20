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
	r.GET("/api/users", getUsers)
	r.GET("/ws", handleConnections)

	r.Static("/static", "./static")
	r.LoadHTMLFiles("static/index.html", "static/register.html", "static/users.html")
	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "index.html", nil)
	})
	r.GET("/register", func(c *gin.Context) {
		c.HTML(200, "register.html", nil)
	})
	r.GET("/users_page", func(c *gin.Context) {
		c.HTML(200, "users.html", nil)
	})

	go handleMessages()

	r.Run(":8080")
}
