
/* Module dependencies. */
var db = require('../accessDB');

module.exports = {

    // JSON REST blahblah for flows
    jsonMenu: function(request, response){

        // define the fields you want to include in your json data
        includeFields = ['_id','menuName','menuType','menuDesc','menuCost','menuCalories','menuOptions','menuAdded'];

        // query for all blog
        queryConditions = {}; //empty conditions - return everything
        var query = db.Menu.find( queryConditions, includeFields);

        query.exec(function (err, menu) {

            // render the card_form template with the data above
            jsonData = {
              'status' : 'OK',
              'JSONtitle' : 'All Menu Items',
              'menu' : menu
            };

            response.json(jsonData);
        });
    }

};