var express     = require('express');
var bodyParser  = require('body-parser');
var oauthserver = require('oauth2-server');

// Create server
var app = express();

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// Parse application/json
app.use(bodyParser.json())

// Create OAuth Server
app.oauth = oauthserver({
  model:  require('./models/oauth'),
  grants: ['password', 'refresh_token'],
  debug:  true
});

// Allow users to get a token from this endpoint
app.post('/oauth/token', app.oauth.grant());
app.get('/secret', app.oauth.authorise(), function(req, res)
{
  res.json('Secret!');
});

// Handle OAuth2 Errors!
app.use(app.oauth.errorHandler());

// Catch 404
app.use(function(req, res, next)
{
    res.status(404).json({
      code  : 404,
      error : "Not Found!"
    });
});

// Error handler
app.use(function(err, req, res, next)
{
  var httpCode = err.status || 500;
  res.status(httpCode).json({
    code  : httpCode,
  	error : err.message
  });
});


app.listen(3000);
console.log('Listening!');
