// // // Node server which whill handle socket io connections and serve the frontend files
// Node server which whill handle socket io connections and serve the frontend files
const http = require("http");
const { Server } = require("socket.io");

// ✅ NEW: Import AI handler
const { handleAIMessage } = require('./ai');

const PORT = process.env.PORT || 8000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Socket.IO Server Running");
});

const io = new Server(server, {
  cors: {
    origin: ["https://chatappbyha.netlify.app"],
    methods: ["GET", "POST"],
  },
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const users = {}; // ✅ changed from `user` to `users`

io.on('connection', socket => {
  socket.on('new-user-joined', name => {
    users[socket.id] = name;
    socket.broadcast.emit('user-joined', name);
  });

  socket.on('send', message => {
    socket.broadcast.emit('receive', { message: message, name: users[socket.id] });
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      socket.broadcast.emit('left', username);
      console.log("🔴 User disconnected:", username);
      delete users[socket.id];
    }
  });

  // ✅ File upload size limit and error-safe broadcasting
  socket.on('file-message', fileData => {
    try {
      if (fileData?.data?.length > 3_500_000) {
        console.warn(`⚠️ File too large from ${users[socket.id] || socket.id}`);
        return;
      }
      socket.broadcast.emit('file-receive', fileData);
    } catch (err) {
      console.error("❌ Error handling file-message:", err);
    }
  });

  // ✅ NEW: AI image/message generator
  socket.on("ai-message", async (prompt) => {
    const aiResponse = await handleAIMessage(prompt);
    socket.emit("receive", { name: "🤖 AI", message: aiResponse });
  });
});

// // Node server which whill handle socket io connections and serve the frontend files
// const http = require("http");
// const { Server } = require("socket.io");
// // add to top
// const { handleAIMessage } = require('./ai');

// const PORT = process.env.PORT || 8000;

// // Basic HTTP server to respond with 200 OK
// const server = http.createServer((req, res) => {
//   res.writeHead(200, { "Content-Type": "text/plain" });
//   res.end("Socket.IO Server Running");
// });

// const io = new Server(server, {
//   cors: {
//     origin: ["https://chatappbyha.netlify.app"],
//     methods: ["GET", "POST"],
//   },
// });

// server.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });

// // const user = {};
// const users = {}; // ✅ Renamed for clarity, keeping original below

// // io.on('connection', socket => {
// io.on('connection', socket => {

//   //IF NAY USER JOINS LET ANY USER KNOW WHO HAS JOINED
//   socket.on('new-user-joined', name => {
//     console.log("New user ", name);
//     // user[socket.id] = name;
//     users[socket.id] = name; // ✅ updated version
//     socket.broadcast.emit('user-joined', name);
//   });

//   //IF SOMEONE SENDS A MESSAGE BORADCAST IT TO ANOTHER PEOPLE
//   socket.on('send', message => {
//     // socket.broadcast.emit('receive', { message: message, name: user[socket.id] })
//     socket.broadcast.emit('receive', { message: message, name: users[socket.id] }); // ✅ updated
//   });

//   //IF SOMEONE LEAVES THE CHAT LET OTHERS KNOW
//   socket.on('disconnect', () => {
//     // const username = user[socket.id];
//     const username = users[socket.id]; // ✅ updated

//     if (username) {
//       socket.broadcast.emit('left', username);
//       console.log("🔴 User disconnected:", username);
//       // delete user[socket.id];
//       delete users[socket.id]; // ✅ updated
//     } else {
//       console.log(`🔴 Unknown user disconnected: ${socket.id}`);
//     }
//   });

//   // ✅ HANDLE FILE/IMAGE/VIDEO MESSAGE AND BROADCAST TO OTHERS
//   socket.on('file-message', fileData => {
//     try {
//       // ✅ Reject large base64 strings (> ~2.5 MB) to prevent disconnects
//       if (fileData?.base64?.length > 3_500_000) {
//         console.warn(`⚠️ File too large from ${users[socket.id] || socket.id}`);
//         return;
//       }
//       socket.broadcast.emit('file-receive', fileData);
//     } catch (err) {
//       console.error("❌ Error handling file-message:", err);
//     }
//   });
//   // inside io.on('connection', socket => { ... })
//   socket.on("ai-message", async (prompt) => {
//     const aiResponse = await handleAIMessage(prompt);
//     socket.emit("receive", { name: "🤖 AI", message: aiResponse });
//   });

//   // socket.on('disconnect', message => {
//   //     socket.broadcast.emit('left', user[socket.id]);
//   //     delete user[socket.id];
//   // });

// });

// // const http = require("http");
// // const { Server } = require("socket.io");

// // const PORT = process.env.PORT || 8000;

// // // Basic HTTP server to respond with 200 OK
// // const server = http.createServer((req, res) => {
// //   res.writeHead(200, { "Content-Type": "text/plain" });
// //   res.end("Socket.IO Server Running");
// // });

// // const io = new Server(server, {
// //   cors: {
// //     origin: ["https://chatappbyha.netlify.app"],
// //     methods: ["GET", "POST"],
// //   },
// // });

// // server.listen(PORT, () => {
// //   console.log(`Server listening on port ${PORT}`);
// // });
// // const user = {};

// // io.on('connection', socket => {
// //   //IF NAY USER JOINS LET ANY USER KNOW WHO HAS JOINED
// //   socket.on('new-user-joined', name => {
// //     console.log("New user ", name);
// //     user[socket.id] = name;
// //     socket.broadcast.emit('user-joined', name);
// //   });
// //   //IF SOMEONE SENDS A MESSAGE BORADCAST IT TO ANOTHER PEOPLE
// //   socket.on('send', message => {
// //     socket.broadcast.emit('receive', { message: message, name: user[socket.id] })
// //   });
// //   // socket.on('disconnect', message => {
// //   //     socket.broadcast.emit('left', user[socket.id]);
// //   //     delete user[socket.id];
// //   // });

// //   //IF SOMEONE LEAVES THE CHAT LET OTHERS KNOW
// //   socket.on('disconnect', () => {
// //     const username = user[socket.id];
// //     socket.broadcast.emit('left', username);
// //     delete user[socket.id];
// //     console.log("User disconnected:", username);
// //   });
// //   // ✅ HANDLE FILE/IMAGE/VIDEO MESSAGE AND BROADCAST TO OTHERS
// //   socket.on('file-message', fileData => {
// //     socket.broadcast.emit('file-receive', fileData);
// //   });

// // });