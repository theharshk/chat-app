Real-time Chat App with Node.js and Socket.IO
A simple real-time chat application built with Node.js and Socket.IO, featuring user join/leave notifications and message broadcasting. The frontend is served separately (e.g., via Live Server) and communicates with the backend WebSocket server.

Features
Real-time communication between multiple users

Users join the chat by entering their name

Notification when a user joins or leaves

Sending and receiving messages with usernames

Plays a notification sound when receiving a message

Handles disconnects properly with accurate user info broadcasted

CORS enabled to allow frontend hosted on different port or domain

Technologies Used
Node.js

Socket.IO (v4.x)

Vanilla JavaScript (Client-side)

HTML/CSS for frontend UI

Getting Started
Prerequisites
Node.js installed on your machine

npm (Node package manager)

Optional: Live Server extension or any HTTP server to serve the frontend files

Installation
Clone the repository or copy the project files

Navigate to the backend folder (or project root if combined)

Install dependencies (if any, here only socket.io server is used, no package.json shown)

bash
Copy
Edit
npm install socket.io
Running the Server
bash
Copy
Edit
node index.js
This will start the Socket.IO server on port 8000 with CORS enabled for your frontend.

Usage
Serve the frontend index.html and client.js files using Live Server or any static server (e.g., VS Code Live Server on port 5500)

Open the frontend URL (e.g., http://127.0.0.1:5500/index.html)

Enter your name when prompted

Start chatting with other connected users

Messages sent will appear with usernames; join/leave notifications are shown

You will hear a sound notification when new messages arrive from others

Notes
Make sure frontend and backend URLs & ports are correctly set (e.g., backend on 8000, frontend served on 5500)

The notification sound file must be accessible by the frontend

Proper cleanup on disconnect avoids stale user info

License
This project is open-source and available under the MIT License.