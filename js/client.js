// Connect to backend Socket.IO server
const socket = io('https://chatapp-backend-production-6607.up.railway.app');

// DOM elements
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");
const fileInp = document.getElementById("fileInp");
const filePreview = document.getElementById("filePreview");

// Incoming message notification audio
const audio = new Audio('onii_chan_message.mp3');

// Function to append a text message to the chat container
const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message', position);
    messageContainer.appendChild(messageElement);

    // Play sound only for incoming messages
    if (position === 'left') audio.play();

    // Always scroll to bottom after new message
    messageContainer.scrollTop = messageContainer.scrollHeight;
};

// Ask user for their name and notify server
const chatname = prompt("Enter your name to join the chat:");
socket.emit('new-user-joined', chatname);

// Listen for new user joins
socket.on('user-joined', name => {
    append(`${name} joined the chat`, 'left');
});

// Listen for incoming messages
socket.on('receive', data => {
    append(`${data.name}: ${data.message}`, 'left');
});

// Listen for users leaving
socket.on('left', name => {
    append(`${name} left the chat`, 'left');
});

// Show file preview before sending
fileInp.addEventListener("change", () => {
    const file = fileInp.files[0];
    const previewBox = document.getElementById("filePreview");
    previewBox.innerHTML = ""; // Clear existing preview

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

        // Add close button to cancel preview
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

    // Wrap and append as an incoming message
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

    // If a file is selected
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
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

            // Show the file to sender immediately
            const wrapper = document.createElement('div');
            wrapper.classList.add('message', 'right');
            wrapper.appendChild(mediaElement);
            messageContainer.appendChild(wrapper);
            messageContainer.scrollTop = messageContainer.scrollHeight;

            // Emit file data to others
            socket.emit("file-message", {
                name: file.name,
                type: file.type,
                data: reader.result
            });
        };
        reader.readAsDataURL(file);
    }

    // If message text is present, send it
    if (message) {
        append(`You: ${message}`, 'right');
        socket.emit('send', message);
    }

    // Clear form fields and preview
    messageInput.value = '';
    fileInp.value = '';
    filePreview.innerHTML = '';
    filePreview.style.display = 'none';
});
