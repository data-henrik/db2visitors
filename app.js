/*jshint node:true*/

// app.js
// This file contains the server side JavaScript code for your application.
// This sample application uses express as web application framework (http://expressjs.com/),
// and jade as template engine (http://jade-lang.com/).

// Written by Henrik Loeser
// Based on the node.js starter application as available on IBM Bluemix (http://bluemix.net)

var express = require('express');
var request = require('request');
var fs = require('fs');

/*require the ibm_db module*/
var ibmdb = require('ibm_db');
//var http = require('http');

var routes = require('./routes/db2access.js');

// setup middleware
var app = express();




app.use(app.router);
app.use(express.errorHandler());
app.use(express.static(__dirname + '/public')); //setup static public directory

app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views

// get DB2 SQLDB service information from Bluemix environment
function findKey(obj,lookup) {
   for (var i in obj) {
      if (typeof(obj[i])==="object") {
         if (i.toUpperCase().indexOf(lookup) > -1) {
            // Found the key
            return i;
         }
         findKey(obj[i],lookup);
      }
   }
   return -1;
}
var env = null;
var key = -1;
var db2creds=null;

// find SQLDB service
if (process.env.VCAP_SERVICES) {
      env = JSON.parse(process.env.VCAP_SERVICES);
      key = findKey(env,'SQLDB');
}
// if not found we are local and load DB2 access information from file
if (!env) {
   console.log("We are local");
   var file = __dirname + '/db2cred.json';
   try {
      db2creds = require(file);
   } catch(err) {
      return {};
   }
} else {
var db2creds = env[key][0].credentials;

}

// At this point we should have the credentials to access DB2
// Construct the connection string
var connString = "DRIVER={DB2};DATABASE=" + db2creds.db + ";UID=" + db2creds.username + ";PWD=" + db2creds.password + ";HOSTNAME=" + db2creds.hostname + ";port=" + db2creds.port;

// render index page by calling getIP
app.get('/', routes.getIP(request,ibmdb,connString));

// call DB2 routine
app.get('/visits', routes.listCountries(ibmdb,connString));


// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);
console.log('App started on port ' + port);

