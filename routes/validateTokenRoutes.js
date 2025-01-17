const express = require('express')
const router = express.Router()
const { authenticateJWT } = require('../middleware/authenticate')

// Route for validate-token
router.post('/', (req, res, next) => {
    authenticateJWT(req, res, (err) => {
        if (err) {
            // If an error is passed, send it as the response
            return res.status(err.status || 500).json(err);
        }

        // If the token is valid, send the decoded token information
        res.status(200).json({
            status: "200",
            message: "Token is valid",
            user: req.user, // Send the decoded token data
        });
    });
});

module.exports = router
