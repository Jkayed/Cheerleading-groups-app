import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ConversationsTab({ currentUserId }) {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3000/users/conversations/${currentUserId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data); // Log the fetched data
        setConversations(data);
      })
      .catch((error) => console.error("Error fetching conversations:", error));
  }, [currentUserId]);
console.log(conversations)
  const openConversation = (receiverId) => {
    navigate(`/messages?receiverId=${receiverId}`);
  };

  return (
    <div className="conversations-tab">
      <h3>Recent Conversations</h3>
      <ul>
        {conversations.map((conversation) => (
          <li key={conversation._id} onClick={() => openConversation(conversation._id)}>
            {conversation.name} {/* Assuming 'name' is the user's name */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConversationsTab;
