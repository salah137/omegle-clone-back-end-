const io = require("socket.io")(3000, {
  cors: {
    origin: "*", // Allow all origins for CORS
  },
});

let available = [];

io.on("connection", (socket) => {
  io.to(socket.id).emit("get-id",socket.id)
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

        console.log("found");
        io.to(pair).emit("found", socket.id, pair);
        io.to(socket.id).emit("found", pair, socket.id);
        
 
      }
    }
    
  });
  socket.on("cancel",(id)=>{
    io.to(id).emit("break")
  })
  // Handle the 'send-stream' event
  

  // Remove socket from available when disconnected
  socket.on("disconnect", () => {
    available = available.filter(id => id !== socket.id);
    console.log(`Socket disconnected: ${socket.id}`);
  });
});
