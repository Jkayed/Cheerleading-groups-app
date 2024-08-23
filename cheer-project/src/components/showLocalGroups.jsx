import React from "react";
import "../css/groupList.css";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Textarea,
} from "@nextui-org/react";

function ShowLocalGroups({ groups }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Function to handle the "Request to Join" action
  const handleRequestToJoin = (groupId) => {
    console.log(groupId);
    // Hard-coded member data
    const newMember = {
      memberID: "hardcodedID",
      firstName: "Hardcoded",
      lastName: "User",
      email: "hardcodeduser@example.com",
      phone: "123-456-7890",
      role: "Member", // Optional role
    };

    // Make the API call to add the member to the group
    fetch(`http://localhost:3000/groups/${groupId}/add-member`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMember),
    })
      .then((response) => response.json())
      .then((updatedGroup) => {
        console.log("Member added successfully:", updatedGroup);
        alert("You have successfully requested to join the group!");
      })
      .catch((error) => {
        console.error("Error adding member:", error);
        alert("There was an error requesting to join the group.");
      });
  };

  return (
    <div className="group-div">
      {groups.length > 0 ? (
        groups.map((group) => (
          <div key={group._id} className="group-item">
            <h2 className="Group-name">{group.groupName}</h2>
            <p className="location">
              {group.city}, {group.state}
            </p>
            <p className="owner">
              Owner: {group.firstName} {group.lastName}
            </p>
            <p className="number">Phone: {group.phone}</p>
            <p className="Group-info">Description: {group.description}</p>

            <Button
              onPress={() => handleRequestToJoin(group._id)}
              className="request-join-button"
            >
              REQUEST TO JOIN
            </Button>
            <hr />
          </div>
        ))
      ) : (
        <p>No groups found within the selected area.</p>
      )}
    </div>
  );
}

export default ShowLocalGroups;
