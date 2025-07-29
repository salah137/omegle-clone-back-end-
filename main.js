const express = require("express");
const cors = require("cors");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

app.use(cors());

let available = [];
const peerMap = new Map(); // Map socket.id => peerId

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("register-id", (peerId) => {
    peerMap.set(socket.id, peerId);
    console.log("hhhh");
    
  });

  socket.on("search", () => {
    available.push(socket.id);
    console.log(`Searching: ${socket.id}`);
    console.log(available);
    
    let pair = null;
    
    if (available.length > 1) {
      while ((!pair || pair === socket.id) && available.length > 1) {
        const idx = Math.floor(Math.random() * available.length);
        console.log(idx);
        
        pair = available[idx];
      }

      if (pair) {
        
        available = available.filter((id) => id !== pair && id !== socket.id);
        
        const myPeerId = peerMap.get(socket.id);
        const otherPeerId = peerMap.get(pair);
        
        console.log(myPeerId,otherPeerId);
        

        if (myPeerId && otherPeerId) {
          console.log("found",myPeerId,otherPeerId);
          
          io.to(socket.id).emit("found", otherPeerId);
          io.to(pair).emit("found", myPeerId);
        }
      }
    }
  });

  socket.on("cancel", (targetSocketId) => {
    io.to(targetSocketId).emit("break");
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    available = available.filter((id) => id !== socket.id);
    peerMap.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
