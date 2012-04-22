
/* Module dependencies. */
var db = require('../accessDB');

module.exports = {

    // JSON REST blahblah for flows
    jsonMenu: function(request, response){

        // define the fields you want to include in your json data
        includeFields = ['_id','menuName','menuDesc','menuCost','menuCalories','menuOptions','menuAdded'];

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
    },

    // JSON REST blahblah for rhymes
    jsonRhymes: function(request, response){

        // define the fields you want to include in your json data
        includeFields = ['rhymeID','flowID','body','topic1','topic2','date'];

        // query for all blog
        queryConditions = {}; //empty conditions - return everything
        var query = db.Rhyme.find( queryConditions, includeFields);

        query.sort('date',-1); //sort by most recent
        query.exec(function (err, rhymes) {

            // render the card_form template with the data above
            jsonData = {
              'status' : 'OK',
              'JSONtitle' : 'All Karaoke Flow Rhymes',
              'rhymes' : rhymes
            };

            response.json(jsonData);
        });
    },

    // JSON REST blahblah for all flows and rhymes
    jsonAll: function(request, response) {

        // define the fields you want to include in your json data
        includeFields = ['flowID','name','compiledFlow','topic1','topic2','date'];

        // query for all blog
        queryConditions = {}; //empty conditions - return everything
        var query = db.Flow.find( queryConditions, includeFields);

        query.sort('date',-1); //sort by most recent
        query.exec(function (err, flows) {

            // define the fields you want to include in your json data
            includeFields_rhymes = ['rhymeID','flowID','body','topic1','topic2','date'];

            // query for all blog
            queryConditions_rhymes = {}; //empty conditions - return everything
            var query2 = db.Rhyme.find( queryConditions_rhymes, includeFields_rhymes);

            query2.sort('date',-1); //sort by most recent
            query2.exec(function (err, rhymes) {
            
                // render the card_form template with the data above
                jsonData = {
                    'status' : 'OK',
                    'JSONtitle' : 'All Karaoke Flows & Rhymes',
                    'flows' : flows,
                    'rhymes': rhymes
                };

                response.json(jsonData);

            });
        });
    }

};