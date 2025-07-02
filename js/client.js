document.addEventListener("DOMContentLoaded", () => {
  // Paste full client.js code inside here


// Connect to backend Socket.IO server
const socket = io('https://chatapp-backend-production-6607.up.railway.app');

// DOM elements
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.getElementById("message-container");
const fileInp = document.getElementById("fileInp");
const filePreview = document.getElementById("filePreview");

// Incoming message notification audio
const audio = new Audio('ringtone.mp3');

// Function to append a text message to the chat container
const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = DOMPurify.sanitize(marked.parse(message));
    messageElement.classList.add('message', position);
    messageContainer.appendChild(messageElement);

    if (position === 'left') audio.play();
    messageContainer.scrollTop = messageContainer.scrollHeight;
};

// Ask user for their name and notify server
const chatname = prompt("Enter your name to join the chat:");
socket.emit('new-user-joined', chatname);

// Listen for new user joins
socket.on('user-joined', name => {
    append(`${name} joined the chat`, 'left');
});

// ✅ UPDATED: Allow AI-generated HTML (e.g., image tag)
socket.on('receive', data => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('message', 'left');

    // ✅ AI messages may return HTML like <img>
    if (data.name === "🤖 AI" && data.message.startsWith("<")) {
        wrapper.innerHTML = data.message;
    } else {
        wrapper.innerText = `${data.name}: ${data.message}`;
    }

    messageContainer.appendChild(wrapper);
    audio.play();
    messageContainer.scrollTop = messageContainer.scrollHeight;
});

// Listen for users leaving
socket.on('left', name => {
    append(`${name} left the chat`, 'left');
});

// Show file preview before sending
fileInp.addEventListener("change", () => {
    const file = fileInp.files[0];
    const previewBox = filePreview;
    previewBox.innerHTML = "";

    if (file) {
        const previewContent = document.createElement("div");
        previewContent.classList.add("file-name");

        if (file.type.startsWith("image/")) {
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.style.maxWidth = "120px";
            img.style.borderRadius = "8px";
            previewContent.appendChild(img);
        } else if (file.type.startsWith("video/")) {
            const video = document.createElement("video");
            video.src = URL.createObjectURL(file);
            video.muted = true;
            video.controls = true;
            video.style.maxWidth = "120px";
            video.style.borderRadius = "8px";
            previewContent.appendChild(video);
        } else {
            previewContent.innerText = `📎 ${file.name}`;
        }

        const closeBtn = document.createElement("button");
        closeBtn.innerText = "x";
        closeBtn.classList.add("close-btn");
        closeBtn.onclick = () => {
            fileInp.value = "";
            previewBox.style.display = "none";
            previewBox.innerHTML = "";
        };

        previewBox.appendChild(previewContent);
        previewBox.appendChild(closeBtn);
        previewBox.style.display = "flex";
    }
});

// Receive file messages from server and display them
socket.on("file-receive", (data) => {
    let mediaElement;

    if (data.type.startsWith("image/")) {
        mediaElement = document.createElement("img");
        mediaElement.src = data.data;
        mediaElement.style.maxWidth = "200px";
        mediaElement.style.borderRadius = "12px";
    } else if (data.type.startsWith("video/")) {
        mediaElement = document.createElement("video");
        mediaElement.src = data.data;
        mediaElement.controls = true;
        mediaElement.style.maxWidth = "250px";
        mediaElement.style.borderRadius = "12px";
    } else {
        mediaElement = document.createElement("a");
        mediaElement.href = data.data;
        mediaElement.download = data.name;
        mediaElement.innerText = `📎 Download ${data.name}`;
    }

    const wrapper = document.createElement('div');
    wrapper.classList.add('message', 'left');
    wrapper.appendChild(mediaElement);
    messageContainer.appendChild(wrapper);
    audio.play();
    messageContainer.scrollTop = messageContainer.scrollHeight;
});

// Handle sending message or file on form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    const file = fileInp.files[0];

    // ✅ NEW: File size validation (2.5MB)
    if (file && file.size > 2.5 * 1024 * 1024) {
        alert("File too large. Please upload a file under 2.5MB.");
        return;
    }

    // ✅ NEW: AI trigger using "@ai <prompt>"
    if (message.startsWith("@ai")) {
        const aiPrompt = message.slice(3).trim();
        append(`You (to AI): ${aiPrompt}`, 'right');
        socket.emit("ai-message", aiPrompt);
        messageInput.value = '';
        return;
    }

    // Handle file upload
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                let mediaElement;

                if (file.type.startsWith("image/")) {
                    mediaElement = document.createElement("img");
                    mediaElement.src = reader.result;
                    mediaElement.style.maxWidth = "200px";
                    mediaElement.style.borderRadius = "12px";
                } else if (file.type.startsWith("video/")) {
                    mediaElement = document.createElement("video");
                    mediaElement.src = reader.result;
                    mediaElement.controls = true;
                    mediaElement.style.maxWidth = "250px";
                    mediaElement.style.borderRadius = "12px";
                } else {
                    mediaElement = document.createElement("a");
                    mediaElement.href = reader.result;
                    mediaElement.download = file.name;
                    mediaElement.innerText = `📎 Download ${file.name}`;
                }

                const wrapper = document.createElement('div');
                wrapper.classList.add('message', 'right');
                wrapper.appendChild(mediaElement);
                messageContainer.appendChild(wrapper);
                messageContainer.scrollTop = messageContainer.scrollHeight;

                socket.emit("file-message", {
                    name: file.name,
                    type: file.type,
                    data: reader.result
                });
            } catch (err) {
                console.error("File send error:", err);
                alert("Failed to send file. Try again.");
            }
        };
        reader.readAsDataURL(file);
    }

    // Handle text message
    if (message) {
        append(`You: ${message}`, 'right');
        socket.emit('send', message);
    }

    // Reset input
    messageInput.value = '';
    fileInp.value = '';
    filePreview.innerHTML = '';
    filePreview.style.display = 'none';
});
});
