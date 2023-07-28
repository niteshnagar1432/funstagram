const io = require('socket.io')();
const socketapi = {
    io: io
};

let onlineUsers = [];

// Add your socket.io logic here!
io.on("connection", function (socket) {
    onlineUsers.push(socket.id);
    console.log(onlineUsers);

    io.emit('onlineUsers',onlineUsers.length);

    socket.on('recivedMsg',function(data){
        io.emit('backendMsg',data);
    })

    socket.on('disconnect',function(){
        console.log('diaconnected....');
        onlineUsers.splice(socket.id,1);
        io.emit('onlineUsers',onlineUsers.length);
    })

});
// end of socket.io logic

module.exports = socketapi;