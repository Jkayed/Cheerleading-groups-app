const express = require("express");
const http = require("http"); // Import http to create a server
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { Server } = require("socket.io"); // Import Server from socket.io
const ObjectId = mongoose.Types.ObjectId;
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
});

const Message = mongoose.model(
  "Message",
  new mongoose.Schema({
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
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

  // Listen for messages
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
    const userObjectId = ObjectId(userId); // Convert userId to ObjectId
    const messages = await Message.find({
      $or: [{ senderId: userObjectId }, { receiverId: userObjectId }],
    });

    // Extract unique user IDs involved in conversations
    const userIds = new Set();
    messages.forEach((msg) => {
      if (msg.senderId.toString() !== userId) userIds.add(msg.senderId);
      if (msg.receiverId.toString() !== userId) userIds.add(msg.receiverId);
    });

    const users = await Contact.find({ _id: { $in: Array.from(userIds) } });

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

// Messaging routes
app.post("/messages", async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  try {
    const message = new Message({ senderId, receiverId, content });
    await message.save();
    res.status(201).json(message);

    // Emit the message via Socket.io
    io.emit("receiveMessage", message);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error });
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
    }).sort("timestamp");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
});

// Get recent conversations for the current user

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
