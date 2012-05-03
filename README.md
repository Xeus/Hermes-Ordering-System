# Hermes Ordering System

by Ben Turner [@Xeus](http://twitter.com/Xeus)

## Description

Final project for Chris Kairalla's Redial class at NYU-ITP, spring 2012.

Menu system using Node.js, MongoDB, jQuery.  Customers at bars, restaurants, whatever dial in to the phone number on a screen or on a table to make their orders, play trivia, read the news, or be social with other tables/stations nearby.

The phone as a remote instead of relying on touchscreens.

Best part?  Everyone's orders are broken up for everyone to pay separately.

## Credits

Thanks to the following for their code:
- Chris Kairalla, [tinyphone](https://github.com/itp-redial/tinyphone)
- John Schimmel, node.js + express [example code](https://github.com/johnschimmel)
- Dustin McQuay, [Twilio SMS code for node.js](http://www.synchrosinteractive.com/blog/9-nodejs/49-send-sms-through-twilio-from-nodejs)

## Dependencies

	{ "name" : "Hermes",
	  "version" : "0.0.5",
	  "dependencies" : {
	    "express" : "2.x",
	    "ejs": "",
	    "mongoose" : "",
	    "request" : "",
	    "mongodb" : "",
	    "connect-mongodb": "",
	    "bcrypt" : "",
	    "passport" : "",
	    "passport-local" : "",
	    "underscore" : "",
	    "socket.io" : "",
	    "emailjs" : "",
	    "restler" : ""
	  } }

## Installation

Open your terminal/shell/command prompt.  Make sure you have Node.js ([http://nodejs.org/](http://nodejs.org/)) installed.

Clone the repository.  Type `git clone git@github.com:Xeus/Hermes-Ordering-System.git` in
the parent directory you wish to install "./Hermes-Ordering-System" to.

See `package.json` for dependencies.  Type `npm install` to install them. Uses
MongoDB and the Heroku toolbelt.

- http://www.mongodb.org/downloads
- https://toolbelt.heroku.com/

Set up your `.env` file to include your `MONGOLAB_URI` variable, which has your
user/pass to connect to MongoDB.  You'll also need to include your gmail user/pass in
the `.env` file as well if you want order confirmation emails sent.  The `.env` should also contain variables for the to, from, and cc email addresses.  Finally, it will include a `SALT` phrase for encryption.  It should look like this:

	MONGOLAB_URI=mongodb://username:password@127.0.0.1:27017/hermes
	GMAIL_USER=yourgmailusername
	GMAIL_PASS=yourgmailpassword
	MAIL_FROM=email@email.com
	MAIL_TO=email@email.com
	MAIL_CC=email@email.com
	SALT=secretphrase

Type `foreman start` in the `./Hermes-Ordering-System` directory to start up the
node.js process.

Connect to `http://localhost:5000` to get your order started!

## Metadata

Last update 02 May 12: Demo'd in class and upped to Github.

Search for "TODO:" to find things requiring more work/fixes.