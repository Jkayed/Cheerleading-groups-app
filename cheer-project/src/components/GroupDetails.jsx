import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import {
  Button,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
} from "@nextui-org/react";
import "../css/managedGroups.css";

const statusColorMap = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

const columns = [
  { name: "NAME", uid: "name" },
  { name: "ROLE", uid: "role" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

function GroupDetails({ groupId, onClose }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Fetch the group members when the component mounts
    fetch(`http://localhost:3000/groups/${groupId}/members`)
      .then((response) => response.json())
      .then((data) => {
        setMembers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching members:", error);
        setLoading(false);
      });
  }, [groupId]);

  const handleMessageClick = (memberId) => {
    // Redirect to /messages with the memberId as a query parameter
    navigate(`/messages?receiverId=${memberId}`);
  };

  const renderCell = React.useCallback((member, columnKey) => {
    const cellValue = member[columnKey];

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", src: member.avatar }}
            description={member.email}
            name={`${member.firstName} ${member.lastName}`}
          />
        );
      case "role":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[member.status]}
            size="sm"
            variant="flat"
          >
            {cellValue || "unknown"}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Send Message">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-message"
                onClick={() => handleMessageClick(member.memberID)} // Use memberID here
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M8 9h8" />
                <path d="M8 13h6" />
                <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z" />
              </svg>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, [navigate]);

  return (
    <ModalContent>
      {members.length > 0 ? (
        <>
          <ModalHeader className="flex flex-col gap-1 text-center w-92 mt-60">
            Group Members
          </ModalHeader>
          <ModalBody>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table
                aria-label="Example table with custom cells"
                className="w-full"
              >
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn
                      key={column.uid}
                      align={column.uid === "actions" ? "center" : "start"}
                    >
                      {column.name}
                    </TableColumn>
                  )}
                </TableHeader>
                <TableBody items={members}>
                  {(item) => (
                    <TableRow key={item.memberID}>
                      {(columnKey) => (
                        <TableCell>{renderCell(item, columnKey)}</TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </ModalBody>
        </>
      ) : (
        <>
          <ModalHeader className="flex flex-col gap-1 text-center w-92 mt-60">
            Group Members
          </ModalHeader>
          <h2 className="flex flex-col gap-1 text-center w-92 m-auto">
            No members
          </h2>
        </>
      )}
    </ModalContent>
  );
}

export default GroupDetails;