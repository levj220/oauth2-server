var db    = require('../controllers/db');    // Databse connection pool
var mysql = require('mysql');
var crypto = require('crypto');

// Create model to export
model = module.exports;

/**
 * Encrypt a password using a salt.
**/
function encryptPassword(password, salt)
{
  // TODO: Put in configs
  var iterations = 2500;
  var keylen = 512;
  return new Buffer(crypto.pbkdf2Sync(password, salt, iterations, keylen), 'binary').toString('base64');
}

/**
 * Check a password given for a user.  If the password is correct, return true
 * otherwise, return false.
**/
function checkUserPassword(user, password)
{
  var hashedPassword = encryptPassword(password, user.salt);
  if(hashedPassword === user.password)
  {
    return true;
  }
  
  return false;
}

model.getUser = function(username, password, done)
{
  db.connect(function(err, conn)
  {
    if(err)
    {
      return done(err);
    }
    
    conn.query('SELECT * FROM users WHERE username = ?', [username], function(err, users)
    {
      // Release connection
      conn.release();
          
      if(err || !users.length)
      {
        return done(err);
      }
      
      // Get user and check password
      var user = users[0];
      if(checkUserPassword(user, password))
      {
        // Good password
        return done(null, user);
      }
      
      // Bad password
      return done(null);
    });
  });
}


model.getAccessToken = function(accessToken, done)
{
  db.connect(function(err, conn)
  {
    if(err)
    {
      return done(err);
    }
    
    conn.query('SELECT * FROM oauth_access_tokens WHERE access_token = ?', [accessToken], function(err, tokens)
    {
      // Release connection
      conn.release();
          
      if(err || !tokens.length)
      {
        return done(err);
      }
      
      // Send token
      var token = tokens[0];
      return done(null, {accessToken: token.access_token, clientId: token.client_id, expires: token.expires, userId: token.user_id});
    });
  });
}

model.getRefreshToken = function(refreshToken, done)
{
  db.connect(function(err, conn)
  {
    if(err)
    {
      return done(err);
    }
    
    conn.query('SELECT * FROM oauth_refresh_tokens WHERE refresh_token = ?', [refreshToken], function(err, tokens)
    {
      // Release connection
      conn.release();
          
      if(err || !tokens.length)
      {
        return done(err);
      }
      
      // Send token
      var token = tokens[0];
      return done(null, {refreshToken: token.refresh_token, clientId: token.client_id, expires: token.expires, userId: token.user_id});
    });
  });
}

model.getClient = function(clientId, clientSecret, done)
{
  db.connect(function(err, conn)
  {
    if(err)
    {
      return done(err);
    }
    
    conn.query('SELECT * FROM oauth_clients WHERE client_id = ? AND client_secret = ?', [clientId, clientSecret], function(err, clients)
    {
      // Release connection
      conn.release();
          
      if(err || !clients.length)
      {
        return done(err);
      }
      
      // Send token
      var client = clients[0];
      return done(null, {clientId: client.client_id, clientSecret: client.client_secret});
    });
  });  
}


model.grantTypeAllowed = function(clientId, grantType, done)
{
  switch(grantType)
  {
    // If password grant, check to ensure the clientId identifies a trusted client
    case 'password':
      db.connect(function(err, conn)
      {
        if(err)
        {
          // Error in connecting
          return done(err);
        }
        
        conn.query('SELECT is_trusted FROM oauth_clients WHERE client_id = ?', [clientId], function(err, clients)
        {
          // Release connection
          conn.release();
              
          if(err || !clients.length)
          {
            return done(err);
          }
          
          // Send token
          var client = clients[0];
          
          if(client.is_trusted == 1)
          {
            return done(null, true);
          }
          
          return done(null, false);
        });
      });  
      break;
      
    case 'refresh_token':
      return done(null, true);
      break;      
      
    // We don't support any other grants right now
    default:
      return done(null, false);
  }
}

model.saveAccessToken = function (accessToken, clientId, expires, user, done) 
{
  // Connect to the database
  db.connect(function(err, conn)
  {
    if(err)
    {
      // Error in connecting
      return done(err);
    }
    
    // Build the SQL query
    var expireTime = (expires) ? expires.getTime() : null;
    var inserts = [accessToken, clientId, user.id, expireTime, accessToken, expireTime];
    var sql = mysql.format('INSERT INTO oauth_access_tokens (access_token, client_id, user_id, expires) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE access_token=?, expires=?', inserts);
    
    // Execute
    conn.query(sql, function(err, status)
    {
      // Release connection
      conn.release();  
          
      if(err)
      {
        // Error in query
        return done(err);
      }
      
      return done(null);
    });
  });
}

model.saveRefreshToken = function (refreshToken, clientId, expires, user, done) 
{
  // Connect to the database
  db.connect(function(err, conn)
  {
    if(err)
    {
      // Error in connecting
      return done(err);
    }
    
    // Build the SQL query
    var expireTime = (expires) ? expires.getTime() : null;
    var inserts = [refreshToken, clientId, user.id, expireTime, refreshToken, expireTime];
    var sql = mysql.format('INSERT INTO oauth_refresh_tokens (refresh_token, client_id, user_id, expires) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE refresh_token=?, expires=?', inserts);
    
    // Execute
    conn.query(sql, function(err, status)
    {
      // Release connection
      conn.release();  
          
      if(err)
      {
        // Error in query
        return done(err);
      }
      
      return done(null);
    });
  });
}

model.generateToken = function (type, req, done)
{
  done(null, null);
}


