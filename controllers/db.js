var mysql = require('mysql');

var connPool = mysql.createPool(
{
    connectionLimit : 100,  //important
    host     : 'localhost',
    user     : '<enter user here>',
    password : '<enter password here>',
    database : 'oauth2_server',
    debug    :  false
});


exports.connect = function(callback) 
{
  connPool.getConnection(function(err, conn) 
  {
    callback(err, conn);
  });
};
