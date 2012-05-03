
/* Module dependencies. */
var db = require('../accessDB');

module.exports = {

    // ******** ADMIN STUFF *************
    // admin stuff all below

    admin: function(request, response) {
        db.Menu.find({}, {}, { sort: { menuName : 'ascending' } }, function (err, menu) {

            if (err) {
                //an error occurred
                console.log("something went wrong");
            }

            var menuTypeList = ['Beer','Food','Liquor','Wine'];

            templateData = {
                pageTitle : "Admin Dashboard",
                menu : menu,
                menuTypeList : menuTypeList
            };
            response.render('admin_dashboard.html', templateData);
        });
    },

    editMenu: function(request, response) {
        db.Menu.findOne({ _id : request.params.menuID }, function (err, menu) {

            if (err) {
                //an error occurred
                console.log("something went wrong");
            }

            var menuTypeList = ['Beer','Food','Liquor','Wine'];

            templateData = {
                pageTitle : "Edit a Menu Item",
                menu : menu,
                menuTypeList : menuTypeList
            };
            response.partial('menu_single_edit.html', templateData);
        });
    },

    editOptions: function(request, response) {
        db.Menu.findOne({ _id : request.params.menuID }, function (err, menu) {

            if (err) {
                //an error occurred
                console.log("something went wrong");
            }
            console.log(menu);

            templateData = {
                pageTitle : "Edit an Option Item",
                menu : menu
            };
            response.partial('options_single_edit.html', templateData);
        });
    },

    addMenu: function(request, response) {

        // Prepare the blog post entry form into a data object
        var menuData = {
            menuName : request.body.menuName,
            menuCost : request.body.menuCost,
            menuDesc : request.body.menuDesc,
            menuCalories : request.body.menuCalories,
            menuType : request.body.menuTypeList
        };

        console.log(menuData);

        // create a new menu item
        var menuItem = new db.Menu(menuData);

        // save the item
        menuItem.save();
        request.flash('newItem', 'New item added!');
        
        if (request.xhr) {
            response.json({
                status :'OK'
            });
        }

    },

    addOption: function(request, response) {

        db.Menu.findOne({_id : request.body.optionMenuList}, function(err, menuItem){
            // Prepare the blog post entry form into a data object
            var optionCost = request.body.optionCost;
            if (optionCost == null || optionCost == "undefined" || optionCost == "") {
                optionCost = 0;
            }
            var optionData = {
                optionName : request.body.optionName,
                optionCost : optionCost,
                optionDesc : request.body.optionDesc
            };

            console.log(optionData);

            // create a new option
            var optionItem = new db.Options(optionData);

            // save the item
            menuItem.menuOptions.push(optionItem);
            menuItem.save();
            request.flash('newItem', 'New item added!');
            
            if (request.xhr) {
                response.json({
                    status : 'OK'
                });
            }
        });

    },

    updateMenu: function(request, response){
        var condition = { _id : request.body.menuID };

        // update these fields with new values
        var updatedData = {
            menuDesc : request.body.menuDesc,
            menuName : request.body.menuName,
            menuCost : request.body.menuCost,
            menuCalories : request.body.menuCalories,
            menuType : request.body.menuTypeList
        };

        // we only want to update a single document
        var options = { multi : false };

        db.Menu.update(condition, updatedData, options, function(err, numAffected){

            if (err) {
                console.log('Update error occurred.');
                response.send('Update error occurred ' + err);
            }

            if (request.xhr) { // if request sent via AJAX
                console.log("Update succeeded.");
                console.log(numAffected + " item(s) updated.");

                //redirect the user to the update page - append ?update=true to URL
                response.json({
                    status :'OK'
                });
            }
            else {
                console.log('updated normally');
                // redirect to the blog entry
                response.redirect('/admin');
            }
        });

    },

    updateOptions: function(request, response){
        var menuID = request.body.menuID;
        var optionID = request.body.optionID;

        /*db.Menu.findById(menuID, function(err, menuItem){
                
                // grab the specific embed doc you want by its id.
                // you can access all properties of the embed doc with '.' dot notation
                menuItem.menuOptions.id(optionID).optionName = request.body.optionName;
                menuItem.menuOptions.id(optionID).optionDesc = request.body.optionDesc;
                menuItem.menuOptions.id(optionID).optionCost = request.body.optionCost;

                // save the main document - which saves the updated embed doc
                menuItem.save();
        }); */

        db.Menu.findById(menuID, function(err, menuItem) {
            if (err) { console.log(err); }
            for (var i=0;i<menuItem.menuOptions.length;i++) {
                if (menuItem.menuOptions[i].optionName == request.body.optionNameOld) {
                    var newCost = parseFloat(request.body.optionCost);
                    menuItem.menuOptions[i].optionName = request.body.optionName;
                    menuItem.menuOptions[i].optionDesc = request.body.optionDesc;
                    menuItem.menuOptions[i].optionCost = newCost;
                    console.log(menuItem);
                }
            }
            menuItem.markModified("menuOptions");
            menuItem.save(function(err) {
                if (err) { console.log(err); }
                else if (request.xhr) { // if request sent via AJAX
                    console.log("Update succeeded.");
                    response.json({ status : "OK" });
                }
            });

        });

    }


};