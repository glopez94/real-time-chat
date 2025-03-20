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
	dbUser.Online = true
	db.Save(&dbUser)
	c.JSON(200, dbUser)
}

func getUsers(c *gin.Context) {
	var users []User
	db.Where("online = ?", true).Find(&users)
	c.JSON(200, users)
}
