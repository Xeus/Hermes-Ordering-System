// TODO: email order https://github.com/eleith/emailjs

/* Module dependencies. */
var db = require('../accessDB');
var _ = require('underscore');
var rest = require('restler');
var util = require('util');

module.exports = {

    // app.get('/'...)
    // userRoute.index
    intro: function(request, response) {
      
        templateData = {};
        response.render('index.html', templateData);
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

    order: function(request, response) {
        console.log(request);
        db.Menu.find({}, {}, { sort: { menuName : 'ascending' } }, function(err, menu) {

            // tabulates the bill and saves it to body of email
            var orderText = "";
            var orderCost = 0;
            var currentTime = new Date();
            orderText += "ORDER FULFILLMENT SUMMARY\n";
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
            orderText += "Order processed, added to tab for customer phone #: " + request.body.phoneNumber + "\n\n";
            orderText += "Courtesy of Hermes Ordering Service\n";

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
                to:      "Hermes Processing <" + process.env.MAIL_TO + ">",
                cc:      "Admin <" + process.env.MAIL_CC + ">",
                subject: "Order Confirmation for " + request.body.phoneNumber
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

    pay: function(request, response) {
        console.log(request);
        db.Menu.find({}, {}, { sort: { menuName : 'ascending' } }, function(err, menu) {

            // tabulates the bill and saves it to body of email
            var orderText = "";
            var orderCost = 0;
            var currentTime = new Date();
            orderText += "SUMMARY OF CUSTOMER'S TAB\n";
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
            orderText += "Total tab processed for customer phone #: " + request.body.phoneNumber + "\n\n";
            orderText += "Courtesy of Hermes Ordering Service\n";

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
                to:      "Hermes Processing <" + process.env.MAIL_TO + ">",
                cc:      "Admin <" + process.env.MAIL_CC + ">",
                subject: "Final Tab Confirmation for " + request.body.phoneNumber
            }, function(err, message) {
                console.log(err || message);
            });

            // Twilio code for SMS
            // thanks http://www.synchrosinteractive.com/blog/9-nodejs/49-send-sms-through-twilio-from-nodejs

            var sendSMS = function(opt, callback) {
                var accountSid = process.env.TWILIO_ACCOUNT_SID,
                    authToken = process.env.TWILIO_AUTH_TOKEN,
                    apiVersion = '2010-04-01',
                    uri = '/'+apiVersion+'/Accounts/'+accountSid+'/SMS/Messages',
                    host = 'api.twilio.com',
                    fullURL = 'https://'+accountSid+':'+authToken+'@'+host+uri,
                    From = opt.From,
                    To = opt.To,
                    Body = opt.Body;

                console.log(accountSid + ", " + authToken);
             
                rest.post(fullURL, {
                    data: { From:From, To:To, Body:Body }
                }).addListener('complete', function(data, response) {
                    console.log(data);
                    console.log(response);
                });
            };

            // object sent to Twilio for SMS
            var smsContents = {
                From : "+19362284585",
                To : "+" + request.body.phoneNumber,
                Body : "HERMES PAYMENT CONFIRMATION FOR " + request.body.phoneNumber + ": Total: $" + orderCost.toFixed(2) + ". Thank you for your patronage!"
            };
            console.log(smsContents);

            var successFunc = function() {
                console.log("Success!");
            };

            sendSMS(smsContents, successFunc);

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