const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const CONNECTION_STRING =
  "mongodb+srv://jkayed0:nOI2coAj1TQE53kV@cluster0.zzrxo.mongodb.net/Cheerapp?retryWrites=true&w=majority";

mongoose
  .connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("Error connecting to MongoDB:", err.message));

// Define Schemas
const memberSchema = new mongoose.Schema({
  memberID: String,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  role: String,
});

const requestSchema = new mongoose.Schema({
  memberID: String,
});

const contactSchema = new mongoose.Schema({
  ownerID: String,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  groupName: String,
  description: String,
  country: String,
  city: String,
  state: String,
  zip: String,
  latitude: String,
  longitude: String,
  members: [memberSchema],
  requests: [requestSchema],
  memberID: String,
});

const Message = mongoose.model(
  "Message",
  new mongoose.Schema({
    senderId: {
      type: String,
      ref: "Contact",
      required: true,
    },
    receiverId: {
      type: String,
      ref: "Contact",
      required: true,
    },
    receiverName: {
      type: String,
      required: true,
    },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  })
);

const Contact = mongoose.model("Contact", contactSchema);

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sendMessage", async (messageData) => {
    try {
      const message = new Message(messageData);
      await message.save();

      // Broadcast the message to all connected clients
      io.emit("receiveMessage", message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/users/conversations/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    const userIds = new Set();
    messages.forEach((msg) => {
      if (msg.senderId !== userId) userIds.add(msg.senderId);
      if (msg.receiverId !== userId) userIds.add(msg.receiverId);
    });

    const users = await Contact.find({
      memberID: { $in: Array.from(userIds) },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversations", error });
  }
});

app.post("/contact", async (req, res) => {
  try {
    const {
      ownerID,
      firstName,
      lastName,
      email,
      phone,
      groupName,
      description,
      country,
      city,
      state,
      zip,
      latitude,
      longitude,
      memberID,
    } = req.body;

    if (!ownerID || !firstName || !lastName || !email || !phone || !groupName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const contact = new Contact({
      ownerID,
      firstName,
      lastName,
      email,
      phone,
      groupName,
      description,
      country,
      city,
      state,
      zip,
      latitude,
      longitude,
      memberID,
    });
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    console.error("Error creating contact:", err.message);
    res
      .status(500)
      .json({ message: "Error creating contact", error: err.message });
  }
});

// Route to request to join a group
app.post("/groups/:groupId/request", async (req, res) => {
  try {
    const { groupId } = req.params;  // Correctly extract groupId from req.params
    const { memberID } = req.body;

    console.log(`Received request to join group ${groupId} with memberID ${memberID}`);

    // Convert groupId to a valid ObjectId using 'new'
    const groupObjectId = new mongoose.Types.ObjectId(groupId);

    // Find the group by its ID
    const group = await Contact.findById(groupObjectId);

    if (!group) {
      console.error(`Group with ID ${groupId} not found`);
      return res.status(404).json({ message: "Group not found" });
    }

    // Create a new request
    const newRequest = { memberID };

    // Add the request to the group's requests array
    group.requests.push(newRequest);

    // Save the updated group
    await group.save();

    res.status(200).json({ message: "Request to join group sent successfully", group });
  } catch (error) {
    console.error("Error processing join request:", error);
    res.status(500).json({ message: "An error occurred on the server", error });
  }
});
app.get("/recent-conversations/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const sentMessages = await Message.aggregate([
      { $match: { senderId: userId } },
      {
        $group: {
          _id: "$receiverId",
          lastMessage: { $last: "$content" },
          timestamp: { $last: "$timestamp" },
          receiverName: { $last: "$receiverName" },
        },
      },
    ]);

    const receivedMessages = await Message.aggregate([
      { $match: { receiverId: userId } },
      {
        $group: {
          _id: "$senderId",
          lastMessage: { $last: "$content" },
          timestamp: { $last: "$timestamp" },
          receiverName: { $last: "$receiverName" },
        },
      },
    ]);

    const allConversations = [...sentMessages, ...receivedMessages];
    allConversations.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    const recentUserIds = allConversations.map((conv) => conv._id);

    const users = await Contact.find({ memberID: { $in: recentUserIds } });

    const recentConversations = allConversations.map((conv) => {
      const user = users.find((u) => u.memberID === conv._id);

      return {
        receiverId: user ? user.memberID : conv._id,
        receiverName: conv.receiverName,
        lastMessage: conv.lastMessage,
        timestamp: conv.timestamp,
      };
    });

    res.json(recentConversations);
  } catch (error) {
    console.error("Error fetching recent conversations:", error);
    res
      .status(500)
      .json({ message: "Error fetching recent conversations", error });
  }
});
// Route to handle join requests for a specific group

app.post("/groups/:groupId/add-member", async (req, res) => {
  const { groupId } = req.params;
  const newMember = req.body;

  try {
    const group = await Contact.findById(groupId);

    if (!group) return res.status(404).send({ message: "Group not found" });

    group.members.push(newMember);
    await group.save();

    res.status(200).send({ message: "Member added successfully", group });
  } catch (error) {
    res.status(500).send({ message: "Error adding member", error });
  }
});

app.get("/groups/:groupId/members", async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Contact.findById(groupId);

    if (!group) return res.status(404).send({ message: "Group not found" });

    res.json(group.members);
  } catch (error) {
    res.status(500).send({ message: "Error fetching members", error });
  }
});

app.get("/groups", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/messages", async (req, res) => {
  const { senderId, receiverId, content, receiverName } = req.body;

  try {
    const message = new Message({
      senderId,
      receiverId,
      content,
      receiverName,
    });
    await message.save();

    io.emit("receiveMessage", message);

    res.status(201).send(message);
  } catch (error) {
    res.status(500).send({ message: "Error saving message", error });
  }
});

app.get("/messages/:userId1/:userId2", async (req, res) => {
  const { userId1, userId2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send({ message: "Error fetching messages", error });
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
