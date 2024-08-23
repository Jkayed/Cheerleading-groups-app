import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import "../../css/messagesPage.css";  // Import the CSS file
import ConversationsTab from "./ConversationsTab";
import { useAuth } from "../../contexts/authContext";
const socket = io("http://localhost:3000");

function MessagesPage() {
    const { currentUser } = useAuth();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const receiverId ="yBHDHAaPUETDU6beAq4aGO3caTi2";  // This is the memberID of the receiver
  const [currentUserId, setCurrentUserId] = useState(currentUser.uid);  // This is the memberID of the current user
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
console.log(receiverId)
  useEffect(() => {
    if (receiverId) {
      fetch(`http://localhost:3000/messages/${currentUserId}/${receiverId}`)
        .then((response) => response.json())
        .then((data) => setMessages(data))
        .catch((error) => console.error("Error fetching messages:", error));

      socket.on("receiveMessage", (newMessage) => {
        if (
          (newMessage.senderId === currentUserId && newMessage.receiverId === receiverId) ||
          (newMessage.senderId === receiverId && newMessage.receiverId === currentUserId)
        ) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      });

      return () => {
        socket.off("receiveMessage");
      };
    }
  }, [currentUserId, receiverId]);

  const sendMessage = async () => {
    const response = await fetch("http://localhost:3000/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderId: currentUserId,  // Use memberID here
        receiverId,               // Use memberID here
        content,
      }),
    });

    if (response.ok) {
      setContent("");
      // Emit the message via Socket.io
      socket.emit("sendMessage", {
        senderId: currentUserId,  // Use memberID here
        receiverId,               // Use memberID here
        content,
      });
    } else {
      console.error("Failed to send message");
    }
  };

  return (
    <div className="messages-page">
      <ConversationsTab currentUserId={currentUserId} />
      <div className="message-container">
        {messages.length > 0
          ? messages.map((message) => (
              <div
                key={message._id}  // Assuming _id is still used as the unique message identifier in your database
                className={message.senderId === currentUserId ? "sent" : "received"}
              >
                <div className="message">
                  <p>{message.content}</p>
                  <small>{new Date(message.timestamp).toLocaleString()}</small>
                </div>
              </div>
            ))
          : "No messages"}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your message"
      ></textarea>
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default MessagesPage;