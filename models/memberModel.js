const mongoose=require('mongoose');

const Memberschema=new mongoose.Schema({
    group_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Groupchats'
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    }

},{timestamps:true});


const Members=mongoose.model('Member',Memberschema)
module.exports=Members;
