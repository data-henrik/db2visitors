// Written by Henrik Loeser
// Some functions to retrieve extended information for a IP address,
// to insert that extended IP record into a DB2 table, and to
// report some basic statistics as part of a second HTML page.



// Insert the JSON record with the IP information as SQL record into DB2.
exports.insertIP = function(ibmdb,connString,ipinfo) {
                   console.log("insertIP called",ipinfo);        
                   ibmdb.open(connString, function(err, conn) {
                         if (err ) {
                            res.send("error occurred " + err.message);
                         }
                         else {
                            // prepare the SQL statement
                            conn.prepare("INSERT INTO IP.VISITORS(vtime,ip,country_code,country,region_code,region,city,zip,latitude,longitude,metro,area) VALUES (current timestamp,?,?,?,?,?,?,?,?,?,?,?)", function(err, stmt) {
                               if (err) {
                                  //could not prepare for some reason
                                  console.log(err);
                                  return conn.closeSync();
                               }

                               //Bind and Execute the statment asynchronously
                               stmt.execute([ipinfo["ip"],ipinfo["country_code"],ipinfo["country_name"],ipinfo["region_code"],ipinfo["region_name"],ipinfo["city"],ipinfo["zipcode"], ipinfo["latitude"], ipinfo["longitude"],ipinfo["metro_code"],ipinfo["area_code"]], function (err, result) {
                                 console.log(err);
                                 // Close the connection to the database
                                 conn.close(function(){
                                   console.log("Connection Closed");
                                 });
                               });
                           });
                        }
                })};


// Get the caller's IP address from runtime environment and call
// geo location service to obtain extended data
exports.getIP=function(request,ibmdb,connString) {
  return function(req, res) {
  var ip = req.headers['x-client-ip'] || req.connection.remoteAddress;
  var ipurl = 'http://freegeoip.net/json/' + ip;
  console.log("yes, called");
  // fetch ip info 
  request.get( {
    url: ipurl,
    json : true},
    function(error, response, body) {
	var ipinfo;
        if (!error) {
	  ipinfo=body;
          // insert IP info into DB2
          exports.insertIP(ibmdb,connString,ipinfo);
          // finish by rendering the HTML page
          res.render('index',{ ipinfo : ipinfo});
	}
     });
}
};



// Very simple country/region-based reporting done using GROUP BY.
exports.listCountries = function(ibmdb,connString) {
                return function(req, res) {
                           
                   ibmdb.open(connString, function(err, conn) {
                                if (err ) {
                                 res.send("error occurred " + err.message);
                                }
                                else {
                                        conn.query("SELECT country, region, count(region) as rcount FROM ip.visitors group by country,region order by 3 desc", function(err, tables, moreResultSets) {
        
                                                                
                                        if ( !err ) { 
                                                res.render('tablelist', {
                                                        "tablelist" : tables
                                                        
                                                 });

                                                
                                        } else {
                                           res.send("error occurred " + err.message);
                                        }

                                        /*
                                                Close the connection to the database
                                                param 1: The callback function to execute on completion of close function.
                                        */
                                        conn.close(function(){
                                                console.log("Connection Closed");
                                                });
                                        });
                                }
                        } );
                   
                }
        }
