/** routes.js
  */
var passport = require('passport');

// Route methods

var mainRoute = require('./routes/main');
var adminRoute = require('./routes/admin');
var jsonRoute = require('./routes/json');
var userRoute = require('./routes/user');

// If user is authenticated, redirect to 
function ensureAuthenticated(request, response, next) {
  if (request.isAuthenticated()) { return next(); }

  request.flash("redirect",request.originalUrl);
  response.redirect('/login');
}

module.exports = function(app) {

    /*********** BLOG ROUTES ************/
    // More Mongoose query information here - http://mongoosejs.com/docs/finding-documents.html


    // ROUTES: main.js
    app.get('/', mainRoute.intro);
    app.get('/menu', mainRoute.menu);
    app.get('/about', mainRoute.about);
    app.post('/emailConfirm', mainRoute.emailConfirm);


    // ROUTES: admin.js
    app.get('/admin', adminRoute.admin);
    app.post('/admin/menu/add', adminRoute.addMenu);
    app.post('/admin/options/add', adminRoute.addOption);
    app.get("/admin/menu/:menuID/edit", adminRoute.editMenu);
    app.get("/admin/options/:menuID/edit", adminRoute.editOptions);
    app.post("/admin/menu/update", adminRoute.updateMenu);
    app.post("/admin/options/update", adminRoute.updateOptions);



    // ROUTES: json.js
    app.get('/menu/json', jsonRoute.jsonMenu);
    app.get('/flows/json', jsonRoute.jsonFlows);
    app.get('/all/json', jsonRoute.jsonAll);



    // ROUTES: user.js
    // Register User - display page
    app.get('/register', userRoute.getRegister);
    //Register User - receive registration post form
    app.post('/register', userRoute.postRegister);
    // Display login page
    app.get('/login', userRoute.login);
    // Login attempted POST on '/local'
    // Passport.authenticate with local email and password, if fails redirect back to GET /login
    // If successful, redirect to /account
    app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function(request, response) {
        if (request.param('redirect') != "") {
            //redirect to page that initiated Login request
            response.redirect( request.param('redirect') );
        } else {
            response.redirect('/account');
        }
        //response.redirect('/account');
    });
    
    // Display account page
    app.get('/account', ensureAuthenticated, userRoute.getAccount);

    app.post('/account/changepassword', ensureAuthenticated, userRoute.postChangePassword),
    
    // Logout user
    app.get('/logout', userRoute.logout);

    app.get('/getusers', userRoute.getUsers);

}