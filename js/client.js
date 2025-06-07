const socket = io('http://localhost:8000');

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



//if the form is submitted, send server the message
form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const message = messageInput.value;
    append(`You: ${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = '';
})

