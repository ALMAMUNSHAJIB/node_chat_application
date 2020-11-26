const chatFrom = document.getElementById('chat-form');
const chatMessage = document.querySelector('.chat-messages');
const roonName = document.getElementById('room-name');
const userList = document.getElementById('users');
 



//Get username and room 
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});
console.log(username, room);


const socket = io();

//Join chat room 
socket.emit('joinRoom', {username, room});

//Get room and user
socket.on('roomUsers', ({room, users}) => {
  outputRoomName(room);
  outputUsers(users);
})

socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //Scroll down
    chatMessage.scrollTop = chatMessage.scrollHeight;
});


//Message submit
chatFrom.addEventListener('submit', e => {
    e.preventDefault();

    //Get message text
    const msg = e.target.elements.msg.value;

    //Emit message to server
    socket.emit('chatMessage', msg);

    //clear input 
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});


//outputMessage to DOM 
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = ` <p class="meta">${message.username} <span> ${message.time}</span></p>
    <p class="text">${message.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div);

};

//Add room name to Dom 
function outputRoomName(room){

    roonName.innerText = room;

};


//Add users to Dom 
function outputUsers(users){
  userList.innerHTML = `
     ${users.map(user => `<li>${user.username}</li>`).join('')}
  `
};
