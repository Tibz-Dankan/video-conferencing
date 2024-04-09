const express = require("express");
const app = express();
const server = require("http").Server(app);
const { Server } = require("socket.io");

const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");
const cors = require("cors");

const { ExpressPeerServer } = require("peer");
const opinions = {
  debug: true,
};

app.use("/peerjs", ExpressPeerServer(server, opinions));
app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  console.log("Getting the root page");

  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    setTimeout(() => {
      socket.to(roomId).emit("user-connected", userId);
    }, 1000);
    socket.on("message", (message) => {
      console.log("message=>:::", message);
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

const PORT = 3030 || process.env.PORT;

server.listen(PORT, () => {
  console.log(`server started on port  ${PORT}`);
});
