/**
*
*
**/
var http = require('http')
var express=require("express");
var app=express();
var server = http.createServer(app)
var io =require('socket.io')(server);
var bodyParser=require('body-parser');
var mongoose=require('mongoose');
server.listen(8010,"localhost");
var settings=require('./settings.js');
var url =settings.url;
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
var conEnsure=require('connect-ensure-login');

var fs = require('fs');
var socket = require('./socketHandler');
socket.start(io);
//-----routers-------------
var prouter=require('./routes/prouter.js');
var resetpasswd=require('./routes/Updatepasswd.js');
var cfrouter=require('./routes/cfrouter.js');
var adminrouter=require('./routes/adminrouter.js');
var eModuleRouteHandler = require('./routes/eModuleRoute');
var moduleRouteHandler = require('./routes/moduleRoute');
var profRouteHandler = require('./routes/profRoute');
var filiereRouteHandler = require('./routes/filiereRoute');
//-----models---------------
//var User=require("./models/User");
var User = require("./models/databaseModels").profs
var Rat=require("./models/rattrappage");
var Matiere=require("./models/Matiere");
var Notes=require("./models/Notes");
var Module=require("./models/Module");
//--------------------------
var datab=null;
var trick=null;
var async = require('async');
mongoose.connect(url);
app.disable("x-powered-by");
app.set('view engine','jade'); 

app.use(function(req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

app.use(express.static(__dirname+"/public",{index:false}));
app.use('/app',express.static(__dirname+"/public/app"));
app.use('/bower_components',express.static(__dirname+"/public/bower_components"));
app.use('/js',express.static(__dirname+"/public/app/js"));
app.use('/css',express.static(__dirname+"/public/app/css"));
app.use('/dist',express.static(__dirname+"/public/bower_components/jquery/dist"));
app.use('/Gest-Charges',express.static(__dirname+"/public/app/Gest-Charges"));
app.use('/Gest-Delib',express.static(__dirname+"/public/app/Gest-Delib"));
app.use('/Settings',express.static(__dirname+"/public/app/Settings"));
app.use('/Gest-Filiere',express.static(__dirname+"/public/app/Gest-Filiere"));
app.use('/Gest-Scolarite',express.static(__dirname+"/public/app/Gest-Scolarite"));
app.use('/login',express.static(__dirname+"/public/app/login"));
app.use('/ChangPassword',express.static(__dirname+"/public/app/ChangPasswd"));

////
var expSession=require('express-session'),
    MongoStore = require('connect-mongo')(expSession);//the session store.
app.use(expSession({secret: '$zxyz-banana-0987choco', resave: false, saveUninitialized: false ,store:new MongoStore({url:'mongodb://127.0.0.1:27017/test'})}));
app.use(passport.initialize());//initialise le middlware passport
app.use(passport.session());  //l'implementation de la session dans passport utilise express-session


//mettre en place la strategie d'authentification passport 
passport.use('local',new LocalStrategy(/*passReqToCallback:true*/{
                        usernameField: 'login',
                        passwordField: 'password'
	                    },
  function(username,password,done) {
	    User.findOne({login: username,password:password}, function(err, user){
      if (err) { return done(err);}
      else if (!user)
							 return done(null, false, {message: 'Incorrect username.'});
						else if	(user.password!=password)
							 return done(null, false, {message: 'Incorrect password.'});
      else{
       return done(null, user);
      }
     }); 
  }));
//=========================================
//sauvgarde des infos d'user authentifié dans le session-store (connect-mongo)
 passport.serializeUser(function(user,done){ 
   done(null,user._id);
 });

//recupère les infos(id+login+security_mask) d'un à partir de la session 
 passport.deserializeUser(function(id, done) {
  User.findById(id,'_id login security_mask filiere active_semestre nom',function(err,user){
   if(!err)done(null,user);
  });
 
 });
app.use(bodyParser.urlencoded({limit:128/*limiter la taille du body par securité*/,extended:true}));
app.use(bodyParser.json());

//=======login_===========
app.get('/login_',function(req,res){
//  my code
  res.status(200).json({info:"non_auto"});
});


//=======installing routes===========
app.use('/',prouter);
app.use('/',cfrouter);
app.use('/',adminrouter);
app.use('/',resetpasswd);

app.use('/gestionfiliere/eModules',eModuleRouteHandler);
app.use('/gestionfiliere/modules',moduleRouteHandler);
app.use('/gestionfiliere/profs',profRouteHandler);
app.use('/gestionfiliere/filiere',filiereRouteHandler);
//================================

/* app.get("/login",function(req,res){
	res.sendFile(__dirname+"/public/index.html");
}); */
app.post('/login',function(req,res) {
     passport.authenticate('local',function(err,user,info){
      if(err){
       res.status(404).json(err);
       return;
      }
      else if(!user){
        res.status(401).json({err:info});
      }else {
        req.logIn(user,function(err){
         if(err) next(err);
         else if(!user.firstlogin){
          res.status(200).json({ok:"firstlogin"});
         }else{
           res.status(200).json({ok:"success"});
         }
        });    
        
      }
     })(req,res);
});
app.get('/ChangPassword/:admin',function(req,res){
//  my code
  res.sendFile('index.html', {root : __dirname + '/public/app/ChangPasswd'});
});

app.post('/ChangPassword/:admin',function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ login: req.user.login}, function(err, user) {
        if (!user) {
          res.status(401).json({err:'username invalid'});
        }
        user.password = req.body.password;
        user.firstlogin = 1;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    }   
  ], function(err) {
    res.status(200).json({ok:"success"});
  });
});

// app.get('/welcom',conEnsure.ensureLoggedIn(0,"/login"),function(req,res){
    // console.log(JSON.stringify(req.user));
	   // res.render("welcom",{user:req.user.name});
// });

//==============outil: js global trim====================================================

var white= new RegExp(/(\s|[^A-Za-z0-9_-]|[\n\r])/g);
String.prototype.gtrim=function(){
	 return this.replace(white,'');
};

//==================================fermer la session=====================================

app.get('/logout',function(req,res){
	 req.logout();
	 res.redirect('/login');
}); 


//-------front-end routes

 app.get("*",function(req,res){
	  res.sendFile("/public/app/index.html",{root:__dirname});
 });

 // check the database if its empty

 User.find({}, function(err, users) {
  if (err) throw err;
  if(users.length==0){
    console.log("database empty");
    var admin=new User({
       nom : 'admin',
       prenom : 'admin',
       password : 'admin',
       login          :'admin',
       security_mask  :8,
       email:'belhadj.gi@gmail.com'
    }); 

    admin.save(function(err) {
    if (err) throw err;
      console.log('compte admin created successfully!');
    });

  };
});


 