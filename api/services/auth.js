const { JWT } = require('@panva/jose');

const config = require('../../config.json');
const bottoken = config.token.split('.')[2];

// JWT key construction

exports.verify = function(req, res) {
  let p = null;
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    const jwt = JWT.decode(req.headers.authorization.split(' ')[1], { complete: true });

    if (jwt.payload.token && jwt.payload.token != bottoken) {
      res.statusMessage = 'Authentication failed. Incorrect Key.';
      res.sendStatus(401);
      return false;
    } 
    if (jwt.payload.token && jwt.payload.token === bottoken) {
      return true;
    }
  }
  res.statusMessage = 'Authentication failed. Key not found.';
  res.sendStatus(401);
  return false;
};
