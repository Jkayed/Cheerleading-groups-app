import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import { Button, Modal, useDisclosure } from "@nextui-org/react";
import GroupDetails from "./GroupDetails";

function ManagedGroups() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null); // State to store selected group ID
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { currentUser } = useAuth();
  console.log(currentUser);
  useEffect(() => {
    fetch(`http://localhost:3000/groups`)
      .then((response) => response.json())
      .then((data) => {
        const filteredGroups = data.filter(
          (group) => group.ownerID === currentUser.uid
        );
        setGroups(filteredGroups);
        console.log(data);
      })
      .catch((err) => {
        console.error("Error fetching group data:", err);
      });
  }, [currentUser.uid]);

  const handleRequestToJoinClick = (groupId) => {
    setSelectedGroupId(groupId);
    onOpen();
  };

  return (
    <>
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
                onPress={() => handleRequestToJoinClick(group._id)}
                className="request-join-button"
              >
                REQUEST TO JOIN
              </Button>
              <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size={"5xl"}
                className="h-5/6"
              >
                <GroupDetails groupId={selectedGroupId} />
              </Modal>
              <hr />
            </div>
          ))
        ) : (
          <p>No groups found.</p>
        )}
      </div>
    </>
  );
}

export default ManagedGroups;
