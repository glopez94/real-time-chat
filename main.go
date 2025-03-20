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

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		username, err := c.Cookie("username")
		if err != nil || username == "" {
			c.Redirect(302, "/login")
			c.Abort()
			return
		}
		c.Next()
	}
}

func main() {
	r := gin.Default()
	initDatabase()

	r.POST("/register", register)
	r.POST("/login", login)
	r.GET("/api/users", authMiddleware(), getUsers)
	r.GET("/ws", authMiddleware(), handleConnections)

	r.Static("/static", "./static")
	r.LoadHTMLFiles("static/index.html", "static/register.html", "static/login.html", "static/users.html", "static/chat.html")
	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "index.html", nil)
	})
	r.GET("/register", func(c *gin.Context) {
		c.HTML(200, "register.html", nil)
	})
	r.GET("/login", func(c *gin.Context) {
		c.HTML(200, "login.html", nil)
	})
	r.GET("/users_page", authMiddleware(), func(c *gin.Context) {
		c.HTML(200, "users.html", nil)
	})
	r.GET("/chat", authMiddleware(), func(c *gin.Context) {
		chatWith := c.Query("user")
		if chatWith == "" {
			c.Redirect(302, "/users_page")
			return
		}
		c.HTML(200, "chat.html", gin.H{"chatWith": chatWith})
	})

	go handleMessages()

	r.Run(":8080")
}
