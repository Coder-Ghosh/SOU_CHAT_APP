
const mongoose=require('mongoose');

const Groupschema=new mongoose.Schema({
    creater_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    name:{
        type:String,
        require:true
    },
    image:{
        type:String,
        required:true
    },
    limit:{
        type:Number,
        require:true
    }

},{timestamps:true});


const Groupchats=mongoose.model('Groupchats',Groupschema);
module.exports=Groupchats;