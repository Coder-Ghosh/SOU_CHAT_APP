require('dotenv').config();


const db=require('./db');

const Users=require('./models/user');

const Chats=require('./models/Chatmodel');

//const express=require('express');

const app=require('express')();

const http=require('http').Server(app);

const userRoute=require('./routes/userRoutes');

const socket=require('socket.io')(http);

app.use('/',userRoute);

var user_id;

var usp=socket.of('/user-namespace');
usp.on("connection",async function(skt){
     console.log('User Connected');
     var userId=skt.handshake.auth.token;
     await Users.findByIdAndUpdate({_id:userId},{$set:{is_online:'1'}});

     skt.broadcast.emit('getOnlineUser',{user_id:userId});


     skt.on("disconnect",async function(){
          console.log('user disconnected');
          var userId=skt.handshake.auth.token;
          await Users.findByIdAndUpdate({_id:userId},{$set:{is_online:'0'}});
          skt.broadcast.emit('getOfflineUser',{user_id:userId});
       
     });

     //chatting programme

     skt.on('newChat',function(data){
             skt.broadcast.emit('loadnewChat',data);

     })

     //Load old chats
     skt.on('existsChat',async function(data){
          var chats=await Chats.find({$or:[{sender_id:data.sender_id,receiver_id:data.receiver_id},{sender_id:data.receiver_id,receiver_id:data.sender_id}]});
          skt.emit('loadChats',{chats:chats});
});

skt.on('DeletedChat',function(data){
       skt.broadcast.emit('Deletethis',data);

});

skt.on('UpdatedChat',function(data){
     skt.broadcast.emit('Updatethismsg',data);

});


//new Group chat

skt.on('newGroupChat',function(data){
     skt.broadcast.emit('ldchatGrp',data);
});

//Delete Group Chat
skt.on('DelGroupchat',function(data){
    skt.broadcast.emit('DeletedGrpMessage',data);

});

skt.on('EditGroupchat',function(data){
     skt.broadcast.emit('EditGrpMessage',data);
 
 });
 


});




http.listen(3000,()=>{
    console.log('App listen on port 3000')});