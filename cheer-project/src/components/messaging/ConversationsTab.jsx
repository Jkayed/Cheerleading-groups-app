import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ConversationsTab = ({ currentUserId }) => {
  const [recentConversations, setRecentConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3000/recent-conversations/${currentUserId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched conversations:", data);
        setRecentConversations(data);
      })
      .catch((error) => console.error("Error fetching recent conversations:", error));
  }, [currentUserId]);

  const handleConversationClick = (receiverId) => {
    console.log("Clicked receiverId:", receiverId);
    navigate(`/messages?receiverId=${receiverId}`);
  };

  return (
    <div className="recent-conversations">
      <h3>Recent Conversations</h3>
      <ul>
        {recentConversations.map((conversation) => (
          <li
        
            onClick={() => handleConversationClick(conversation.receiverId)}
          >
            <div className="conversation-item">
              <strong>{conversation.receiverName}</strong>
              <p>{conversation.lastMessage}</p>
              <small>{new Date(conversation.timestamp).toLocaleString()}</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationsTab;