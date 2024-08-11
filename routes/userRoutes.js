const express=require('express');

const user_route= express();

const bodyParser=require('body-parser');

const auth=require('../middleware/auth');

const userController=require('../controllers/userControllers');

const session=require('express-session');

const cookieParser=require('cookie-parser');



const {SESSION_SECRET}=process.env;

user_route.use(session({
    secret:SESSION_SECRET,
    resave: false ,
    saveUninitialized: false 

}));
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:false}));

user_route.set('view engine','ejs');
user_route.set('views','./views');
user_route.use(express.static('public'));
user_route.use(cookieParser());
const path=require('path');
const multer=require('multer');

const storage=multer.diskStorage({
    destination:(req,res,next)=>{
                next(null,path.join(__dirname,'../public/images'))
    },
    filename:(req,res,next)=>{
         const name=Date.now()+'-'+res.filename;
         next(null,name);

    }
})

const upload=multer({storage:storage });

user_route.get('/register',auth.isLogout,userController.registerLoad);
user_route.post('/register',upload.single('image'),userController.register);
user_route.get('/',auth.isLogout,userController.loadLogin);
user_route.post('/',userController.login);
user_route.get('/logout',auth.isLogin,userController.logout);
user_route.get('/dashboard',auth.isLogin,userController.loadDashboard);
user_route.post('/save_chat',userController.saveChat);
user_route.post('/delete_chat',userController.deleteChat);
user_route.post('/update_chat',userController.updateChat);
user_route.get('/groups',auth.isLogin,userController.loadGroups);
user_route.post('/groups',upload.single('image'),userController.createGroups);

user_route.post('/fetchmember',auth.isLogin,userController.getMembers)
user_route.get('/fetchmember',auth.isLogin,userController.getMembers)
user_route.post('/addMembers',auth.isLogin,userController.addMembers);
user_route.post('/Update-chat-groups',upload.single('image'),userController.UpdateChatGroup);
user_route.post('/delete-chat-groups',auth.isLogin,userController.deleteChatGroup);
user_route.get('/share-group/:id',userController.shareGroup);
user_route.post('/join-group',userController.joinnow);
user_route.get('/group-chat',auth.isLogin,userController.groupChat);
user_route.post('/group_save_chat',auth.isLogin,userController.savegroupChat);
user_route.post('/load-group-chat',auth.isLogin,userController.loadgroupChats);
user_route.post('/del_grp_chat',auth.isLogin,userController.delgroupChats);
user_route.post('/update_grp_chat',auth.isLogin,userController.UpdategroupChats);

user_route.get('*',function(req,res){
    res.redirect('/');
})

module.exports=user_route;