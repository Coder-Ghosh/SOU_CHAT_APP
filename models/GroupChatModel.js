const mongoose=require('mongoose');

const groupChatschema=new mongoose.Schema({
    sender_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    group_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Groupchats'
    },
    message:{
        type:String,
        required:true
    }

},{timestamps:true});


const GroupMessage=mongoose.model('Groupmessage',groupChatschema);
module.exports=GroupMessage;