var db    = require('./controllers/db');
var async = require('async');
var crypto = require('crypto');

function encryptPassword(password, salt)
{
  var iterations = 2500;
  var keylen = 512;
  return new Buffer(crypto.pbkdf2Sync(password, salt, iterations, keylen), 'binary').toString('base64');
}

function insertClient(callback)
{
  db.connect(function(err, conn)
  {
    if(err)
    {
      consele.log(err);
      return callback();
    }
    
    // Create client
    conn.query('INSERT INTO oauth_clients (client_id, client_secret, is_trusted) VALUES (?, ?, ?)', ['client', 'secret', 1], function(err)
    {
      conn.release();
      
      if(err)
      {
        console.log(err);
      }

      return callback();      
    });
  });
}

function insertUser(callback)
{
  db.connect(function(err, conn)
  {
    if(err)
    {
      consele.log(err);
      return callback();
    }
    
    // Generate salt, then encrypt password
    var salt = crypto.randomBytes(128).toString('base64');
    var hashedPassword = encryptPassword('123456', salt);    
    
    // Create user
    conn.query('INSERT INTO users (id, username, password, salt, first_name, last_name) VALUES (UUID(), ?, ?, ?, ?, ?)', ['user1', hashedPassword, salt, 'Ron', 'Swanson'], function(err)
    {
      conn.release();
      
      if(err)
      {
        console.log(err);
      }

      return callback();      
    });
  });
}

// Create a list of tasks
var asyncTasks = [insertClient, insertUser];

// Run them
async.parallel(asyncTasks, function()
{
  // Exit when done
  process.exit();
});

