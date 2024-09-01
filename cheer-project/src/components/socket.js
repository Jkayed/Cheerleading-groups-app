import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("http://localhost:3000");

useEffect(() => {
  const handleReceiveMessage = (newMessage) => {
    if (
      (newMessage.senderId === currentUserId &&
        newMessage.receiverId === receiverId) ||
      (newMessage.senderId === receiverId &&
        newMessage.receiverId === currentUserId)
    ) {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }
  };

  socket.on("receiveMessage", handleReceiveMessage);

  return () => {
    socket.off("receiveMessage", handleReceiveMessage);
  };
}, [receiverId]);
// Ensure this effect only runs when receiverId changes
