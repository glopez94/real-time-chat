package main

import (
	"github.com/gin-gonic/gin"
)

func register(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	var existingUser User
	db.Where("username = ?", user.Username).First(&existingUser)
	if existingUser.ID != 0 {
		c.JSON(400, gin.H{"error": "Username already exists"})
		return
	}
	db.Create(&user)
	c.JSON(200, user)
}

func login(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var dbUser User
	db.Where("username = ? AND password = ?", user.Username, user.Password).First(&dbUser)
	if dbUser.ID == 0 {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	// Marcar usuario como online
	db.Model(&dbUser).Update("Online", true)

	c.SetCookie("username", dbUser.Username, 3600, "/", "", false, true)

	// Notificar a todos los clientes WebSocket que la lista de usuarios cambió
	broadcastUsers()

	c.JSON(200, dbUser)
}

func logout(c *gin.Context) {
	username, _ := c.Cookie("username")
	var user User
	db.Where("username = ?", username).First(&user)

	// Marcar usuario como offline
	db.Model(&user).Update("Online", false)

	c.SetCookie("username", "", -1, "/", "", false, true)

	// Notificar a todos los clientes WebSocket que la lista de usuarios cambió
	broadcastUsers()

	c.Redirect(302, "/login")
}

func getUsers(c *gin.Context) {
	var users []User
	db.Find(&users)
	// db.Where("online = ?", true).Find(&users) // Solo los usuarios en línea
	c.JSON(200, users)
}

func getChat(c *gin.Context) {
	username, _ := c.Cookie("username")
	recipient := c.Query("user")
	var user1, user2 User
	db.Where("username = ?", username).First(&user1)
	db.Where("username = ?", recipient).First(&user2)

	var chat Chat
	db.Where("(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)", user1.ID, user2.ID, user2.ID, user1.ID).First(&chat)
	if chat.ID == 0 {
		chat = Chat{User1ID: user1.ID, User2ID: user2.ID}
		db.Create(&chat)
	}

	db.Preload("Messages").Find(&chat)
	c.JSON(200, gin.H{"chat": chat})
}

func sendMessage(c *gin.Context) {
	var msg Message
	if err := c.ShouldBindJSON(&msg); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	var chat Chat
	db.Where("id = ?", msg.ChatID).First(&chat)
	db.Create(&msg)
	chat.Messages = append(chat.Messages, msg)
	db.Save(&chat)
	broadcast <- msg
	c.JSON(200, msg)
}
