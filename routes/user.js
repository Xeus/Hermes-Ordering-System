
/* Module dependencies. */
var db = require('../accessDB');

module.exports = {

    // app.get('/register'...)
    getRegister: function(request, response) {
        templateData = {
            loggedIn : false,
            admin : false
        }
        response.render('register.html', templateData);
    },

    // app.post('/register'...)
    postRegister: function(request, response) {
        userData = {
              fname : request.param('firstname')
            , lname : request.param('lastname')
            , email : request.param('email')
            , password : request.param('password')
            , allLists : false,
             admin : false
        }
        
        db.saveUser(userData, function(err,docs) {
            response.redirect('/admin');
        });
    },

    postChangePassword : function(request, response) {
        if (request.param('password') == request.param('password2')) {
            
            //look up user
            db.User.findById(request.user._id, function(err, user){
                
                //set the new password
                user.set('password', request.param('password'));
                user.save();
                
                // set Flash message and redirect back to /account
                request.flash("message", "Password was updated");
                response.redirect('/account');
                
            })
            
        } else {
            
            request.flash("message", "Passwords Do Not Match");
            response.redirect('/account');
        }
    },
    
    // app.get('/login', ...
    login: function(request, response) {

        // will show admin nav edit links if logged in
        if (request.user) { var loggedIn = true; } else { var loggedIn = false; }
        
        if (request.xhr) {
            templateData = {
                message: request.flash('error')[0], // get error message if received from prior login attempt
                redirect : request.flash("redirect"),
                loggedIn : loggedIn,
                admin : false,
                solo : false
            }

            response.partial('login.html', templateData);
        }
        else {
            templateData = {
                message: request.flash('error')[0], // get error message if received from prior login attempt
                redirect : request.flash("redirect"),
                loggedIn : false,
                admin : false,
                solo : true
            }
            response.render('login.html', templateData);
        }
    },

    // app.get('/account', ensureAuthenticated, ...
    getAccount: function(request, response) {

        // will show admin nav edit links if logged in
        if (request.user) { var loggedIn = true; } else { var loggedIn = false; }
        templateData = {
            currentUser : request.user,
            message : request.flash('message')[0], // get message is received from prior form submission like password change
            loggedIn : loggedIn,
            admin : false
        }
    
        response.render('account.html', templateData );
    },

    getUsers : function(request, response) {
        
        // query for all users only retrieve email and name
        db.User.find({},['email','name.first','name.last'], function(err,users) {
            
            if (err) {
                console.log(err);
                response.send("an error occurred");
            }
            
            response.json(users);
            
        })
        
    },
    
    // app.get('/logout'...)
    logout: function(request, response){
        request.logout();
        response.redirect('/');
    }

};