package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var clients = make(map[*websocket.Conn]string)
var broadcast = make(chan Message)

func handleConnections(c *gin.Context) {
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer ws.Close()
	username, _ := c.Cookie("username")
	clients[ws] = username

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			delete(clients, ws)
			// Notify other users that this user has left the chat
			broadcast <- Message{Username: username, Recipient: msg.Recipient, Message: fmt.Sprintf("%s has left the chat with %s.", username, msg.Recipient)}
			break
		}
		broadcast <- msg
	}
}

func handleMessages() {
	for {
		msg := <-broadcast
		for client, username := range clients {
			if username == msg.Username || username == msg.Recipient {
				err := client.WriteJSON(msg)
				if err != nil {
					client.Close()
					delete(clients, client)
				}
			}
		}
	}
}

func broadcastUsers() {
	var users []User
	db.Find(&users)
	// db.Where("online = ?", true).Find(&users) // Solo los usuarios en línea

	// usernames := []string{}
	// for _, user := range users {
	// 	usernames = append(usernames, user.Username)
	// }

	data, _ := json.Marshal(map[string]any{
		"type":  "users_update",
		"users": users,
	})

	for client := range clients {
		client.WriteMessage(websocket.TextMessage, data)
	}
}
