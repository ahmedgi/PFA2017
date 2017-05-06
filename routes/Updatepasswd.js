var express    =require('express');
var router=express.Router();
var async     =require('async');
var conEnsure =require('connect-ensure-login');
var nodemailer=require('nodemailer');
var flash=require('express-flash');
var crypto=require('crypto');
var smtpTransport = require('nodemailer-smtp-transport');
//-----models---------------
var User = require("../models/databaseModels").profs;
router.use(flash());

router.get('/forgot',function(req,res){
	res.render('forgot',{
		user : req.user
	});
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'Aucun compte avec cette adresse email n\'existe.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var transport = nodemailer.createTransport(smtpTransport({
        host : 'smtp.gmail.com',
        port : 587,
        secure : false,
        auth: {
          user: 'belhadj.gi@gmail.com',
          pass: 'caramel019'
        }
      }));
      var mailOptions = {
        to: user.email,
        from: 'belhadj.gi@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'Vous recevez cela parce que vous (ou quelqu\'un d\'autre) avez demandé la réinitialisation du mot de passe pour votre compte.\n\n' +
          'Cliquez sur le lien suivant ou collez-le dans votre navigateur pour compléter le processus:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'Si vous ne l\'avez pas demandé, ignorez ce courriel et votre mot de passe restera inchangé.\n'
      };
      transport.sendMail(mailOptions, function(err) {
        req.flash('info', 'Un email a été envoyé à ' + user.email + ' Avec d\'autres instructions');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Le token de réinitialisation du mot de passe est invalide ou a expiré.');
      return res.redirect('/forgot');
    }
    res.render('reset', {
      user: req.user
    });
  });
});
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Le token de réinitialisation du mot de passe est invalide ou a expiré.');
          return res.redirect('back');
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
       // user.resetPasswordExpires = undefined;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
      var transport = nodemailer.createTransport(smtpTransport({
        host : 'smtp.gmail.com',
        port : 587,
        secure : false,
        auth: {
          user: 'belhadj.gi@gmail.com',
          pass: 'caramel019'
        }
      }));
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'Ceci confirme que le mot de passe de votre compte' + user.email + ' Ceci confirme que le mot de passe de votre compte  vient d\'être modifié..\n'
      };
      transport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Votre mot de passe a été changé.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/app');
  });
});

module.exports=router;
