const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors( {
  origin: "*", // Specify your frontend domain
  methods: "*",  // Allowed methods
  credentials: false,  // If you need to send cookies or other credentials
}
));
app.options('*', cors());  // Allow preflight requests for all routes

const server = require('http').createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});



let available = [];

io.on("connection", (socket) => {
  io.to(socket.id).emit("get-id", socket.id);

  socket.on("search", () => {
    available.push(socket.id);
    console.log(`Socket connected: ${socket.id}`);

    let pair = null;

    if (available.length > 1) {
      while ((!pair || pair === socket.id) && available.length > 1) {
        let index = Math.floor(Math.random() * available.length);
        pair = available[index];
      }

      if (pair) {
        available = available.filter(id => id !== pair && id !== socket.id);

        // Notify both users that they have been paired
        io.to(pair).emit("found", socket.id, pair);
        io.to(socket.id).emit("found", pair, socket.id);
      }
    }
  });

  socket.on("cancel", (id) => {
    io.to(id).emit("break");
  });

  // Remove socket from available when disconnected
  socket.on("disconnect", () => {
    available = available.filter(id => id !== socket.id);
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Bind the server to a port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
