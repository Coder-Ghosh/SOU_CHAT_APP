const Users=require('../models/user');
const Chats=require('../models/Chatmodel');
const bcrypt=require('bcrypt');
const Groups=require('../models/Groupchat');

const mongoose=require('mongoose');
const session = require('express-session');
const Members = require('../models/memberModel');
const Groupchat=require('../models/GroupChatModel');


const registerLoad=async(req,res)=>{
    try{
        res.render('Register');
    }
    catch(err){
        console.log(err);
    }

}

const register=async(req,res)=>{
    let email=req.body.email;
    let fnd=await Users.findOne({email:email})
    if(fnd)
    {
      res.render('Error');
    }
    else{
    try{
    const hashpassword=await bcrypt.hash(req.body.password,10);
    const userdata=new Users({
        name:req.body.name,
        email:req.body.email,
        image:'images/'+req.file.filename,
        password:hashpassword
     });
     await userdata.save();
     console.log("Data Saved Succesfully");
     res.render('login',{message:'Registration Done'});
}
catch(err){
    console.log(err);
}
}}

const loadLogin=async(req,res)=>{
    try
    {
        res.render('login');
    }
    catch(err){

    }
}

const login=async(req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;
        const userData=await Users.findOne({email:email});
        if(userData){
            const is_match=await bcrypt.compare(password,userData.password);
            if(is_match)
            {
                req.session.user=userData;
                res.cookie("User",JSON.stringify(userData));
                res.redirect('/dashboard');
            }
            else{
                   res.render('login',{message:'Email or password not match'});
            }
        }
        else{
            res.render('login',{message:'Username or password wrong'});
        }

    }
    catch(err){
        
    }
}

const logout=async(req,res)=>{
    try
    {
        req.session.destroy();
        res.clearCookie("User");
        res.redirect('/');
    }
    catch(err){
        
    }
}

const loadDashboard=async(req,res)=>{
    try{
        let users=await Users.find({_id:{$nin:[req.session.user._id]}});

        res.render('Dashboard',{user:req.session.user,users:users});
    }
    catch(err){
        
    }
}

const saveChat=async(req,res)=>{
       try
       {
          var cht=new Chats({
            sender_id:req.body.sender_id,
            receiver_id:req.body.receiver_id,
            message:req.body.message,
          });     
          var ncht=await cht.save();
          console.log(ncht);
          res.send({success:true,msg:'Chat Stored in DB',data:ncht});
       }
       catch(err){
        res.send({success:false,msg:'Something Went Wrong'});
       }

}

const deleteChat=async (req,res)=>{
      try{

         await Chats.deleteOne({_id:req.body.id});
         res.send({success:true});
      }
      catch(err)
      {
        res.send({success:false,msg:err.msg});
      }
    }


    const updateChat=async (req,res)=>{
        try{
  
        var updt= await Chats.findByIdAndUpdate({_id:req.body.id},{$set:{message:req.body.message}});
    
           res.send({success:true,update:updt});
        }
        catch(err)
        {
          res.send({success:false,msg:err.msg});
        }
      }
  
const loadGroups=async(req,res)=>{

     try{

        let grp=await Groups.find({creater_id:req.session.user._id })
        res.render('group',{groups:grp});
     }
     catch(err)
     {
       console.log(err);
     }

}

const loadGrp=async(req,res)=>{

    try{

       let grp=await Groups.find({creater_id:req.session.user._id })
       res.render('CreateGroup',{groups:grp});
    }
    catch(err)
    {
      console.log(err);
    }

}



const createGroups= async(req,res)=>{

    try{
        const group=new Groups({
        creater_id:req.session.user._id,
        name:req.body.name,
        image:'images/'+req.file.filename,
        limit:req.body.limit
    });
        await group.save();
        //let grp=await Groups.find({creater_id:req.session.user._id })
       res.render('CreateGroup',{message:req.body.name+'Group Created Successfully!'});
    }
    catch(err)
    {
      console.log(err);
    }

}



const getMembers=async (req,res)=>{
    try{
  
    var data= await Users.aggregate([

     {
        $lookup:{
          from:"members",
          localField:"_id",
          foreignField:"user_id",
          pipeline:[{
                   $match:{
                        $expr:{
                              $and:[
                                      
                                      {$eq:["$group_id" ,new mongoose.Types.ObjectId( req.body.group_id)]}
                                    
                              ]
                        }
                   }
        }],
          as:"member"
        }
     },
     {
         $match:{
          "_id":{ 
            $nin:[new mongoose.Types.ObjectId( req.session.user._id)]
          }
        }
        
     }

    
    
    ]);                       //find({_id:{ $nin:req.session.user._id}});

      
      res.send({success:true,data:data});
    }
    catch(err)
    {
      res.send({success:false,msg:err.msg});
    }
  }

  const addMembers=async (req,res)=>{
    try{
      
      var dt=(req.body);
      
      
      var nm=[]
      var nm=dt['members[]']
      
       
      if(!nm)
      {
          res.send({success:false,msg:'Please Select Any member'});
      }
      else if(nm.length==24)
      {
        res.send({success:true,msg:'Members added successfully'}); 
      }
      else if(nm.length > parseInt(req.body.limit))
        {
          res.send({success:false,msg:'Can not Select more than '+req.body.limit+' members'});
        }
      else{

           await Members.deleteMany({group_id:dt.group_id});
            var data=[];
            for(let i=0;i<nm.length;i++)
            {
              data.push({
                     group_id:dt.group_id,
                     user_id:nm[i]

              });
            }
            await Members.insertMany(data);

        res.send({success:true,msg:'Members added successfully'});
      }

     
    }
    catch(err)
    {
      res.send({success:false,msg:err.msg});
    }
  }

  const UpdateChatGroup=async(req,res)=>{

      try{
        console.log(req.body);
            if(parseInt(req.body.limit)<parseInt(req.body.last_limit))
            {
              await Members.deleteMany({ group_id:req.body.id});
            }
            var updateObj;
            if(req.file != undefined)
            {
              updateObj={
                 name:req.body.name,
                 image:'images/'+req.file.filename,
                 limit:req.body.limit 
              }
            }
            else
            {
              updateObj={
                name:req.body.name,
                limit:req.body.limit 
             }
            }
            await Groups.findByIdAndUpdate({_id:req.body.id},{$set:updateObj});
            res.send({success:true,msg:'Group Updated Succesfully'})
      }
      catch(err){
                res.send({success:false,msg:err.message});
      }

  }

const deleteChatGroup=async(req,res)=>{
    try{
       await Groups.deleteOne({_id:req.body.id});
       await Members.deleteMany({group_id:req.body.id});
       res.send({success:true,msg:'Group Deleted Succesfully'})
    }
    catch(err)
    {
      res.send({success:false,msg:err.message});
    }

}

const shareGroup=async(req,res)=>{

     try{
            var grpData=await Groups.findOne({_id:req.params.id});
        
            if(!grpData)
            {
              res.render('Error',{message:'Group Not Found'});
            }
            else if(req.session.user == undefined){
              res.render('Error',{message:'Please Login'});
            }
            else
            {
              var totalMembers=await Members.find({group_id:req.params.id}).countDocuments();
              var available=grpData.limit-totalMembers;
              var isOwner=grpData.creater_id==req.session.user._id? true:false;
              var isJoined=await Members.find({group_id:req.params.id,user_id:req.session.user._id}).countDocuments();
            
             console.log(isJoined);
              res.render('shareLink',{group:grpData,available:available,totalMember:totalMembers,isOwner:isOwner,isJoined:isJoined});

            }
     }
     catch(err)
     {
            console.log(err);
     }

}

const joinnow=async(req,res)=>{
  try{
    let member=new Members({
      group_id:req.body.group_id,
      user_id:req.session.user._id
    });
    await member.save();
    res.send({success:true,msg:'You have joined'});
  }
  catch(err)
  {
    res.send({success:false,msg:err.message});
  }
}


const groupChat=async(req,res)=>{
  try{
       const myGroup=await Groups.find({creater_id:req.session.user._id});
      const joinGroup=await Members.find({user_id:req.session.user._id}).populate('group_id');
     // console.log(joinGroup);
     
       res.render('chatgrp',{myGroups:myGroup,joinGroups:joinGroup});
  }
  catch(err)
  {
     console.log(err.message);
  }
}

const savegroupChat=async(req,res)=>{

try
{
   var chat=new Groupchat({
      sender_id:req.body.sender_id,
      group_id:req.body.group_id,
      message:req.body.message


   });
   var newcht=await chat.save();
  
   res.send({success:true,chat:newcht});
}
catch(err){
  console.log(err);
}

}

const loadgroupChats=async(req,res)=>{

try{

    const chts=await  Groupchat.find({group_id:req.body.group_id});
     res.send({success:true,chats:chts});
}
catch(err)
{

  res.send({success:false,msg:err.message});
}

}


const delgroupChats=async(req,res)=>{

   try
   {
         await Groupchat.deleteOne({_id:req.body.id});
         res.send({success:true,msg:'Chat Deleted'});
   }
   catch(err){
      res.send({success:false,msg:err.message});

   }
}

const UpdategroupChats=async(req,res)=>{

try
{
    await Groupchat.findByIdAndUpdate({_id:req.body.id},{$set:{message:req.body.message}})
    res.send({success:true,msg:'Chat Updated'});
  }
catch(err)
{
    res.send({success:false,msg:err.message});
}


}







module.exports={
    registerLoad,register,loadLogin,login,logout,loadDashboard,saveChat,deleteChat,updateChat,loadGroups,createGroups,getMembers,loadGrp,addMembers,UpdateChatGroup,deleteChatGroup,shareGroup,joinnow,groupChat,savegroupChat,loadgroupChats,delgroupChats,UpdategroupChats
}