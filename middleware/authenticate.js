const jwt = require('jsonwebtoken');

let blackListedToken = [];

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization; // Get Authorization header

    const token = authHeader?.split(' ')[1]; // Extract the token
    if (!token) {
        return res.status(401).json({ status: "401", message: "Unauthorized access: Token missing!" });
    }

    if(blackListedToken.includes(token)){
        return res.status(401).json({ status: "401", message: "Unauthorized access: Invalid token"});
    }

    jwt.verify(token, process.env.SECRETKEY, (err, decodedToken) => {
        if (err) {
            return res.status(403).json({ status: "403", message: "Unauthorized access: Invalid token!" });
        }
        req.user = decodedToken.user?.id; // Attach decoded user to req
        next();
    });
}

function logout(req,res){
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]

    if(!token){
        return res.status(401).json({ status: "401", message: "Unauthorized access: Token missing"});
    }

    blackListedToken.push(token);

    return res.status(200).json({ status: "200", message: "Logged Out Successfully"})

}


module.exports = { authenticateJWT, logout };
