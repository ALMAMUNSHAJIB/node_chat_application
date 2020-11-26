const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessages = require('./utlis/messages');
const {userJoin, getCurrentUser, userLeaves, getRoomUsers} = require('./utlis/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server); 

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

const name = 'ChatRoom';

// run  when client connect
io.on('connection', socket => {
 socket.on('joinRoom', ({username, room}) => {
  
  const user = userJoin(socket.id, username, room);
  socket.join(user.room);

   //wlcome current user 
 socket.emit('message', formatMessages(name,'Welcome to chatroom'));

 //Brosdcast when user connect 
 socket.broadcast.to(user.room).emit('message', formatMessages(name, `${user.username} hase joined chat room`));
  
  //Send user and room info
  io.to(user.room).emit('roomUsers', {
    room: user.room,
    users: getRoomUsers(user.room)
  });
 })
  
 //listing for chatMessage
 socket.on('chatMessage', msg => {
  const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessages(user.username, msg));
 });

 //Disconnect client
 socket.on('disconnect', () => {
   const user = userLeaves(socket.id);
   if(user){
    io.to(user.room).emit('message', formatMessages(name,`${user.username} hase left`));
   };
   //Send user and room info
  io.to(user.room).emit('roomUsers', {
    room: user.room,
    users: getRoomUsers(user.room)
  });
   
 });

});




const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Server is on going: ${port}`);
});
