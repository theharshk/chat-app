// Node server which whill handle socket io connections and serve the frontend files
const PORT = process.env.PORT || 8000;

const io = require('socket.io')(PORT, {
    cors: {
        origin: ["https://chatappbyha.netlify.app"],
        methods: ["GET", "POST"]
    }
});


const user = {};

io.on('connection', socket => {
    //IF NAY USER JOINS LET ANY USER KNOW WHO HAS JOINED
    socket.on('new-user-joined', name => {
        console.log("New user ", name);
        user[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });
    //IF SOMEONE SENDS A MESSAGE BORADCAST IT TO ANOTHER PEOPLE
    socket.on('send', message => {
        socket.broadcast.emit('receive', { message: message, name: user[socket.id] })
    });
    // socket.on('disconnect', message => {
    //     socket.broadcast.emit('left', user[socket.id]);
    //     delete user[socket.id];
    // });

    //IF SOMEONE LEAVES THE CHAT LET OTHERS KNOW
    socket.on('disconnect', () => {
        const username = user[socket.id];
        socket.broadcast.emit('left', username);
        delete user[socket.id];
        console.log("User disconnected:", username);
    });
});