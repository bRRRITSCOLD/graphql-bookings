const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const authorizationHeader = req.get('authorization');
    if (!authorizationHeader) {
      req.isAuthorized = false;
      return next();
    }

    const [ tag, token ] = authorizationHeader.split(' ');
    if (!token || token === '') {
      req.isAuthorized = false;
      return next();
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken || decodedToken === '') {
      req.isAuthorized = false;
      return next();
    }

    req.isAuthorized = true;
    req.userId = decodedToken.userId;

    return next();
  } catch (err) {
    req.isAuthorized = false;
    return next();
  }
}