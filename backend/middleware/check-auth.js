const jsonwebtoken = require ('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];  // by convention "bearer token" (bearer to imply token usage)
    const decodedToken = jsonwebtoken.verify(token, process.env.TOKEN_JWT_SECRET);  // throws error if is not valid token (catched below)
    req.userData = {  // attaching token data in request
      username: decodedToken.username, 
      email: decodedToken.email, 
      userId: decodedToken.userId
    };
    next();
  } catch (error) {  // in case of failing on extracting the token out of the header or verifying the token
    res.status(401).json({  message: "User not authenticated!"});
  }
};