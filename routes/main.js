// TODO: email order https://github.com/eleith/emailjs

/* Module dependencies. */
var db = require('../accessDB');
var _ = require('underscore');

module.exports = {

    // app.get('/'...)
    // userRoute.index
    index: function(request, response) {
      
        templateData = {}
        response.render('index.html', templateData);
    },

    intro: function(request, response) {
        var flowNames = [];

        db.Flow.find({ active : true }, ["name"], function(err, activeFlowNames) {
            if (err) { console.log(err); }
            console.log(activeFlowNames.length);

            // autocomplete for finding active flows via input field
            for (var i=0;i<activeFlowNames.length;i++) {
                flowNames.push(activeFlowNames[i].name);
            }

            // will show admin nav edit links if logged in
            if (request.user) { var loggedIn = true; } else { var loggedIn = false; }

            var templateData = {
                pageTitle : "Karaoke Flow",
                activeFlowNames : flowNames,
                admin : false, // shows admin nav if true
                loggedIn : loggedIn
            };
    
            response.render("index.html", templateData);
        });
    },

    menu: function(request, response) {
        db.Menu.find({}, {}, { sort: { menuName : 'ascending' } }, function(err, menu) {
            if (err) { console.log(err); }
            else {
                var templateData = {
                    menu : menu
                };
                response.render("interface.html", templateData);
            }
        });
    },

    emailConfirm: function(request, response) {
        db.Menu.find({}, {}, { sort: { menuName : 'ascending' } }, function(err, menu) {

            // tabulates the bill and saves it to body of email
            var orderText = "";
            var orderCost = 0;
            var currentTime = new Date();
            orderText += "ORDER SUMMARY\n";
            orderText += currentTime + "\n\n";
            for (var i=0; i<menu.length; i++) {
                for (var j=0; j<request.body.toBuy.length; j++) {
                    if (menu[i]._id == request.body.toBuy[j]) {
                        orderText += menu[i].menuName + " :: $" + menu[i].menuCost.toFixed(2) + "\n";
                        orderCost += menu[i].menuCost;
                    }
                }
            }
            orderText += "-----------------------------\n";
            orderText += "TOTAL COST: $" + orderCost.toFixed(2) + "\n\n";
            orderText += "Thank you for your patronage!\n";
            orderText += "Hermes Ordering Service\n";

            // configs the email login settings
            var email   = require("emailjs");
            var server  = email.server.connect({
                user:     process.env.GMAIL_USER, 
                password: process.env.GMAIL_PASS, 
                host:     "smtp.gmail.com", 
                ssl:      true
            });

            // send the message and get a callback with an error or details of the message that was sent
            server.send({
                text:    orderText, 
                from:    "Hermes Ordering Front-End <" + process.env.MAIL_FROM + ">", 
                to:      "Hermes Order Confirm <" + process.env.MAIL_TO + ">",
                cc:      "Admin <" + process.env.MAIL_CC + ">",
                subject: "Order Confirmation"
            }, function(err, message) {
                console.log(err || message);
            });

            if (request.xhr) {
                response.json({
                    status : 'OK'
                });
            }
        });
    },

    about: function(request, response) {

        // will show admin nav edit links if logged in
        if (request.user) { var loggedIn = true; } else { var loggedIn = false; }
        
        var templateData = {
            pageTitle : "What's All This About?",
            admin : false,
            loggedIn : loggedIn
        };

        response.render("about.html", templateData);
    }

};