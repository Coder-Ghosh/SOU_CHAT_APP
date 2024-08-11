//This file is responsible for setup database connectivity

const mongoose=require('mongoose');

//Define mogodb connection URL
const mongoURL='mongodb://127.0.0.1:27017/Hotels'

//Setup mongodb connection

mongoose.connect(mongoURL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});


//Get the default connection
//Mongoose maintain a default connection object  representing the mongodb connection
const db=mongoose.connection;

db.on('connected',()=>{
    console.log("Connected to mongodb server");
})

db.on('error',(err)=>{
    console.error("error:",err);
})

db.on('disconnected',()=>{
    console.log("Setup is disconnected");
})

module.exports=db;