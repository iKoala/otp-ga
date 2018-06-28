'use strict';

var express = require('express')
var app = express()
var qr = require('qr-image');
var base32 = require('base32.js');
var notp = require('notp');

var key = 'secretkey';

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.get('/qrcode', function(req, res) {
  // encoded will be the secret key, base32 encoded
  var encoded = base32.encode(new Buffer(key));

  // Google authenticator doesn't like equal signs
  var encodedForGoogle = encoded.toString().replace(/=/g,'');

  // to create a URI for a qr code (change totp to hotp if using hotp)
  var uri = 'otpauth://totp/somelabel?secret=' + encodedForGoogle;

  res.header('Content-Type', 'image/png');
  var qr_svg = qr.image(uri, { type: 'png' });
  qr_svg.pipe(res);
});

app.get('/verify/:token', function(req, res) {
  var token = req.params.token;

  console.log(`token ${token}`);

  // Check TOTP is correct (HOTP if hotp pass type)
  var login = notp.totp.verify(token, key);

  // invalid token if login is null
  if (!login) {
    res.send('Token invalid');
    return console.log('Token invalid');
  }

  // valid token
  console.log('Token valid, sync value is %s', login.delta);
  res.send(`Token valid, sync value is ${login.delta}`);
});

app.listen(3000)
