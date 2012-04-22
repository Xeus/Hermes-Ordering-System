
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

    createGET: function(request, response) {
        console.log("Inside app.get('/create')");

        var flowCount = Flow.count(); // count starts at 0
        console.log(flowCount);
    
        var randRoomNum = Math.floor(Math.random()*10000); // makes somewhat random room name
        var randRoomName = "room" + randRoomNum;

        // will show admin nav edit links if logged in
        if (request.user) { var loggedIn = true; } else { var loggedIn = false; }

        // prepare new flow with the form data
        var flowData = {
            flowID : flowCount,
            name : randRoomName,
            admin : false,
            loggedIn : true
        };
    
        var newFlow = new Flow(flowData);
        newFlow.save();

        response.redirect("/create/" + flowID); // send to general /create page
    },

    createNew: function(request, response) {
        console.log("Inside app.post('/createnew')");
        console.log("form received and includes:")
        console.log(request.body);

        db.FlowStat.findOne({ flowStatsID : 0 }, function(err, flowCountRecord) {
            if (err) { console.log(err); }
            if (flowCountRecord == null) {
                console.log("flowCount null");
                var flowStatsData = {
                    flowStatsID : 0,
                    flowCount : 0,
                    rhymeCount : 0
                };
                var newFlowStat = new FlowStat(flowStatsData);
                newFlowStat.save();
                console.log("saved to FlowStat: " + flowStatsData);
            }
            else {
                console.log("found count");
                var flowStatsData = {
                    flowStatsID : 0,
                    flowCount : flowCountRecord.flowCount
                };
            }

            var flowData = {
                flowID : flowStatsData.flowCount,
                name : request.body.newFlowName,
                active : true
            };
    
            var newFlow = new db.Flow(flowData);
            newFlow.save();

            // increment global flow number count
            db.FlowStat.findOne({ flowStatsID : 0 }).update( { $inc: { flowCount : 1 } } );

            response.redirect("/create/" + flowData.flowID); // send to specific ID'd /create page
        });

    },

    createPOST: function(request, response) {
        console.log("Inside app.post('/create')");
        console.log("form received and includes:")
        console.log(request.body);
       
        db.Flow.findOne({ name : request.body.flowName, active : true }, function(err,flow) {

            if (err) {
                console.log('Error');
                console.log(err);
                response.send("Uh oh, can't find an active flow by that name.");
            }
            else {
                console.log(flow);
                if (flow == null) {
                    var templateData = {
                        pageTitle : "Karaoke Flow"
                    };
                    response.send("Flow not found. :(");
                }
                else {
                    // have to do checking for multiple rooms w/ same name
                    response.redirect("/create/" + flow.flowID); // send to general /create page
                }
            }
        });
    },

    createFlowIDGET: function(request, response) {
        console.log("Inside app.post('/create/:flowID')");
        console.log("form received and includes:")
        console.log(request.body);
        
        /*
        var newFlow = {
            rhyme : request.body.rhyme,
            startTime : Date.now()
        };
        //console.log(newFlow.startTime);
        
        flowArray.push(newFlow);
        flowNumber = flowArray.length - 1;
        */

        var topics = new Array('basketball', 'fame', 'football', 'women', 'riches', 'violence', 'nyc','oakland', 'cops', 'federal govt', 'mom', 'dad', 'swag', 'tennis', 'twitter', 'skype', 'champagne', 'itp');

        // returns number reference, use with array topics to get actual string result
        getRandomTopic = function() { return Math.floor(Math.random() * topics.length); };
        var randomTopicNum1 = getRandomTopic();
        var randomTopicNum2 = getRandomTopic();

        db.Flow.findOne({ flowID : request.params.flowID }, function(err,flow) {

            if (err) {
                console.log('Error');
                console.log(err);
                response.send("Uh oh, can't find that flow!");
            }
            else {

                // timer set to 5 minutes from create date (* 60 seconds * 1000 milliseconds)
                var minutes = 5;
                var endTime = flow.date.valueOf() + 60 * minutes * 1000;
                console.log("endTime: " + endTime);
                console.log("flow.date: " + flow.date.valueOf());
                var currentTime = new Date();
                console.log("currentTime: " + currentTime.valueOf());
                var timeRemaining = Math.floor((endTime - currentTime.valueOf()) / 1000);
                // will show admin nav edit links if logged in
                if (request.user) { var loggedIn = true; } else { var loggedIn = false; }
                var templateData = {
                    pageTitle : "Step #2: Create da Rhymes :: Karaoke Flow",
                    randomTopic1 : topics[randomTopicNum1],
                    randomTopic2 : topics[randomTopicNum2],
                    flow : flow,
                    timeRemaining : timeRemaining,
                    admin : false,
                    loggedIn : loggedIn
                };

                if (timeRemaining <= 1) { // if no time left, auto-fwd to last pg
                    response.redirect("/perform/" + flow.flowID);
                }
                else { // or just keep adding rhymes
                    response.render("create.html", templateData);
                }
            }
        });

    },

    createFlowIDPOST: function(request, response) {
        console.log("Inside app.post('/create/:flowID')");
        console.log("form received and includes:")
        console.log(request.body);
    
        /*
        var newFlow = {
            rhyme : request.body.rhyme,
            startTime : Date.now()
        };
        //console.log(newFlow.startTime);
    
        flowArray.push(newFlow);
        flowNumber = flowArray.length - 1;
        */

        var topics = new Array('basketball', 'fame', 'football', 'women', 'riches', 'violence', 'nyc','oakland', 'cops', 'federal govt', 'mom', 'dad', 'swag', 'tennis', 'twitter', 'skype', 'champagne', 'itp');

        getRandomTopic = function() { return Math.floor(Math.random() * topics.length); };
        var randomTopicNum1 = getRandomTopic();
        var randomTopicNum2 = getRandomTopic();

        db.Flow.findOne({ flowID : request.params.flowID }, function(err,flow) {

            if (err) {
                console.log('Error');
                console.log(err);
                response.send("Uh oh, can't find that flow!");
            } // /end if error
            else {

                // timer set to 5 minutes from create date (* 60 seconds * 1000 milliseconds)
                var minutes = 5;
                var endTime = flow.date.valueOf() + 60 * minutes * 1000;
                console.log("endTime: " + endTime);
                console.log("flow.date: " + flow.date.valueOf());
                var currentTime = new Date();
                console.log("currentTime: " + currentTime.valueOf());
                var timeRemaining = Math.floor((endTime - currentTime.valueOf()) / 1000);

                db.FlowStat.findOne({ flowStatsID: 0 }, function(err, getRhymeCount) {
                    var nextRhymeCount = getRhymeCount.rhymeCount+1;
                    var rhymesTemp = request.body.rhyme;
                    var rhymesJoined = rhymesTemp.join("|");
                    rhymesJoined.replace(",",", ");
                    var rhymeData = {
                        body : rhymesJoined,
                        rhymeID : nextRhymeCount,
                        flowID : request.params.flowID,
                        topic1 : request.body.topic1,
                        topic2 : request.body.topic2
                    };

                    var newRhyme = new db.Rhyme(rhymeData);
                    newRhyme.save();

                });
            
                // TODO: is it saving to db?
                var flowData = {
                    topic1 : request.body.topic1,
                    topic2 : request.body.topic2
                };

                var rhymesTemp = request.body.rhyme;
                var rhymesJoined = rhymesTemp.join("|");
                rhymesJoined.replace(",",", ");

                db.FlowStat.findOne({ flowStatsID : 0 }).update( { $inc: { rhymeCount : 1 } } );
                db.Flow.findOne({ flowID : request.params.flowID }).update({ $push : { compiledFlow : rhymesJoined } }).update({ topic1 : request.body.topic1, topic2 : request.body.topic2 });

                // will show admin nav edit links if logged in
                if (request.user) { var loggedIn = true; } else { var loggedIn = false; }

                var templateData = {
                    pageTitle : "Step #2: Create da Rhymes :: Karaoke Flow",
                    randomTopic1 : request.body.topic1,
                    randomTopic2 : request.body.topic2,
                    flow : flow,
                    timeRemaining : timeRemaining,
                    admin : false,
                    loggedIn : loggedIn
                };

                if (timeRemaining <= 0) {
                    response.redirect("/perform/" + flow.flowID);
                }
                else {
                    response.render("create.html", templateData);
                }
            } // /end if no error
        });

        },

    performFlowID: function(request, response) {

        db.Flow.findOne({ flowID : request.params.flowID }, function(err,flow) {

            if (err) {
                console.log('Error');
                console.log(err);
                response.send("Uh oh, can't find that flow!");
            }
            else {

                var rhymes = flow.compiledFlow;
                if (rhymes == undefined || rhymes == null) {
                    rhymes = "[no rhymes entered]";
                }

                var rhymes2 = rhymes.toString();
                var rhymesSplit = rhymes2.split(/[,\|]/);

                var beats = ['drake_onone', 'wizkhalifa_sots', '36mafia_hard'];
                var randomBeat = Math.floor(Math.random() * beats.length);

                // will show admin nav edit links if logged in
                if (request.user) { var loggedIn = true; } else { var loggedIn = false; }

                var flowData = {
                    flowName : flow.name,
                    pageTitle : "Step #2: Perform da Rhymes :: Karaoke Flow",
                    rhymesSplit : rhymesSplit,
                    admin : false,
                    randomBeat : randomBeat,
                    beats : beats,
                    loggedIn : loggedIn,
                    layout: false // has its own layout
                };

                // Render the perform template - pass in the flowData.
                response.render("perform.html", flowData);
            }

        });

    },

    performRandom: function(request, response) {

        db.Rhyme.find({}, function(err, rhymes) {

            if (err) {
                console.log('Error');
                console.log(err);
                response.send("Uh oh, error compiling a random flow!");
            }
            else {
                var numRhymes = 10;
                var randomRhymes = '';
                var usedRhymes = [];

                var randomRhymeGen = function() {
                    return Math.floor(Math.random() * numRhymes);
                }
                
                if (rhymes == undefined || rhymes == null) {
                    rhymes = "[no rhymes entered]";
                }
                // don't want to look for more random rhymes than db actually has
                if (rhymes.length < numRhymes) { numRhymes = rhymes.length; }
                for (var i=0; i<numRhymes; i++) {
                    var rhymeLoop = false;
                    while (rhymeLoop == false) {
                        var randomRhymeNum = randomRhymeGen();
                        if (_.indexOf(usedRhymes, randomRhymeNum) == -1 && rhymes[randomRhymeNum] != undefined) {
                            randomRhymes += rhymes[randomRhymeNum].body + ",";
                            usedRhymes.push(randomRhymeNum);
                        }
                        else {
                            rhymeLoop = true;
                        }
                    }
                }

                var rhymes2 = randomRhymes.toString();
                var rhymesSplit = rhymes2.split(/[,\|]/);

                var beats = ['drake_onone', 'wizkhalifa_sots', '36mafia_hard'];
                var randomBeat = Math.floor(Math.random() * beats.length);

                // will show admin nav edit links if logged in
                if (request.user) { var loggedIn = true; } else { var loggedIn = false; }

                var rhymeData = {
                    flowName : "da illest random flow",
                    pageTitle : "Step #2: Perform da Random Rhymes :: Karaoke Flow",
                    rhymesSplit : rhymesSplit,
                    admin : false,
                    randomBeat : randomBeat,
                    beats : beats,
                    loggedIn : loggedIn,
                    layout: false // has its own layout
                };

                // Render the perform template - pass in the flowData.
                response.render("perform.html", rhymeData);
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