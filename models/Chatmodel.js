const mongoose=require('mongoose');

const Chatschema=new mongoose.Schema({
    sender_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    receiver_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    message:{
        type:String,
        required:true
    }

},{timestamps:true});


const Chats=mongoose.model('Chat',Chatschema);
module.exports=Chats;