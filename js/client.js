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

