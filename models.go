package main

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username string `json:"username" gorm:"unique"`
	Password string `json:"password"`
	Online   bool   `json:"online"`
}

type Message struct {
	Username string `json:"username"`
	Message  string `json:"message"`
}
