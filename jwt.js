const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req, res, next) => {

    //First check if the request has an authorization header or not
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ error: "Authorization header is missing" });
    }

    //Extract the jwt token from the authorization header
    const token = req.headers.authorization.split(" ")[1];
    if( !token) return res.status(401).json({ error: "Unauthorized or Authorization header is missing" });
    
    try {
        //Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        //Attach the decoded user information to the request object
        req.user = decoded;
        
        //Call the next middleware or route handler
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired JWT token" });
    }
};

// Function to generate a JWT token
const generateToken = (userData) => {
    //Gnerate a new JWT token using the user data and secret key
    return jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: 36000});
};

module.exports = { jwtAuthMiddleware, generateToken };