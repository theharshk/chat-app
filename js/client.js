const socket = io('https://chatapp-backend-production-6607.up.railway.app');

//GET DOM ELEMENTS IN THE JS FILE
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");

//AUDIO THE WIL PLAY WHEN A NEW MESSAGE IS GOING TO RECEIVED
var audio = new Audio('onii_chan_message.mp3');

//FUCTION WHICH WILL APPENDS NEW ELENMENTS TO THE CONTAINER
const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message; 
    messageElement.classList.add('message', position);
    messageContainer.append(messageElement);
    if (position == 'left') {
        audio.play();
    }
 
};

// // Prompt user for name to join the chat
const chatname = prompt("Enter your name to join the chat:");

// console.log("Emitted new-user-joined:", chatname);
//IF A NEW USER JOINS LET OTHERS KNOW
socket.emit('new-user-joined', chatname);
// console.log("Received user-joined event:", chatname);
socket.on('user-joined', chatname => {
    append(`${chatname} joined the chat`, 'left');
});
// IF SERVERS SENDS A MESSAGE AND RECEIVE IT
socket.on('receive', data => {
    append(`${data.name}:${data.message}`, 'left');
});
//IF A USERS LEFT THE CHAT APPENDS THE INFO TO THE CONTAINER
socket.on('left', data => {
    append(`${data} left the chat`, 'left');
});
//WHEN THE FORM IS SUBMITTED SEND THE MESSAGE TO THE SERVER
const fileInp = document.getElementById("fileInp");
// Handle file message reception / sending
const filePreview = document.getElementById("filePreview");

// SHOW FILE PREVIEW BEFORE SUBMISSION
fileInp.addEventListener("change", () => {
    const file = fileInp.files[0];
    filePreview.innerHTML = '';

    if (!file) {
        filePreview.style.display = "none";
        return;
    }

    const previewBox = document.createElement("div");
    previewBox.style.border = "1px solid #ddd";
    previewBox.style.padding = "10px";
    previewBox.style.borderRadius = "10px";
    previewBox.style.background = "#f9f9f9";
    previewBox.style.margin = "10px";
    previewBox.style.display = "flex";
    previewBox.style.alignItems = "center";
    previewBox.style.justifyContent = "space-between";
    previewBox.style.gap = "10px";

    // Media preview
    let media;
    if (file.type.startsWith("image/")) {
        media = document.createElement("img");
        media.src = URL.createObjectURL(file);
        media.style.maxWidth = "60px";
        media.style.borderRadius = "6px";
    } else if (file.type.startsWith("video/")) {
        media = document.createElement("video");
        media.src = URL.createObjectURL(file);
        media.muted = true;
        media.autoplay = true;
        media.loop = true;
        media.style.maxWidth = "80px";
        media.style.borderRadius = "6px";
    } else {
        media = document.createElement("span");
        media.innerText = "📄";
        media.style.fontSize = "24px";
    }

    // Info
    const info = document.createElement("div");
    info.innerHTML = `<strong>${file.name}</strong><br><small>${(file.size / 1024).toFixed(1)} KB</small>`;

    // Cancel Button
    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "❌ Cancel";
    cancelBtn.style.border = "none";
    cancelBtn.style.background = "#ff4d4d";
    cancelBtn.style.color = "white";
    cancelBtn.style.padding = "5px 10px";
    cancelBtn.style.borderRadius = "6px";
    cancelBtn.style.cursor = "pointer";

    cancelBtn.onclick = () => {
        fileInp.value = '';
        filePreview.innerHTML = '';
        filePreview.style.display = "none";
    };

    // Append everything
    previewBox.appendChild(media);
    previewBox.appendChild(info);
    previewBox.appendChild(cancelBtn);
    filePreview.appendChild(previewBox);
    filePreview.style.display = "block";
});


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
});


form.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = messageInput.value;
    const file = fileInp.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            // 👇 Show the media to sender
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
            } else {
                mediaElement = document.createElement("a");
                mediaElement.href = reader.result;
                mediaElement.download = file.name;
                mediaElement.innerText = `📎 Download ${file.name}`;
            }

            const wrapper = document.createElement('div');
            wrapper.classList.add('message', 'right'); // 👈 sender style
            wrapper.appendChild(mediaElement);
            messageContainer.appendChild(wrapper);
            messageContainer.scrollTop = messageContainer.scrollHeight;

            // 📤 Send to others
            socket.emit("file-message", {
                name: file.name,
                type: file.type,
                data: reader.result
            });
        };
        reader.readAsDataURL(file);
    }

    if (message.trim() !== '') {
        append(`You: ${message}`, 'right');
        socket.emit('send', message);
    }

    messageInput.value = '';
    fileInp.value = '';
});


