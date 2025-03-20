package main

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username string `json:"username" gorm:"unique"`
	Password string `json:"password"`
	Online   bool   `json:"online"`
}

type Message struct {
	gorm.Model
	Username  string `json:"username"`
	Recipient string `json:"recipient"`
	Message   string `json:"message"`
	ChatID    uint   `json:"chat_id"`
}

type Chat struct {
	gorm.Model
	User1ID  uint      `json:"user1_id"`
	User2ID  uint      `json:"user2_id"`
	Messages []Message `json:"messages"`
}
