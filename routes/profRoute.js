var express = require('express');
var async = require('async')
var conEnsure = require('connect-ensure-login');
var databaseModels = require('../models/databaseModels')

var errorMessage = function (code, message) {
    return {code: code, message: message}
}

var okMessage = function (code, message, data) {
    return {code: code, message: message, data: data}
}


var router = express.Router();


router.post("/currentUser", conEnsure.ensureLoggedIn(0, "/login_"), function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(okMessage('200', '', req.user)));
});

//{userId : id,searchQuery : {key : value},responseFields : "filed1 filed2 ..",populate : [{path : '',select:''}]}
router.post("/getProf", conEnsure.ensureLoggedIn(0, "/login_", true), function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    console.log("response is : ");
    async.series([
            function (callback) {
                var query = databaseModels.profs.find(req.body.searchQuery, req.body.responseFields);
                //query.populate('createdBy');
                if (req.body.populate)
                    for (var i = 0; i < req.body.populate.length; i++) {
                        query.populate(req.body.populate[i]);
                    }
                //.populate('updatedBy')
                //.populate({path : 'sendTo.id',select :'nom'})
                query.exec(
                    function (err, profs) {
                        if (err) return callback({code: '002', message: "database problem!!"}, null);
                        callback(null, profs);
                    });
            }
        ],
        function (err, data) {
            if (err) {
                res.send(JSON.stringify(err, null, '\t'));
                console.log(JSON.stringify(err, null, '\t'))
            }
            else {
                res.send(JSON.stringify({code: "200", message: "", data: data[0]}, null, '\t'));
                console.log(JSON.stringify({code: "200", message: "", data: data[0]}, null, '\t'))
            }

        });

});


module.exports = router;
