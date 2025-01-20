const express = require('express')
const router = express.Router()
const userController = require('../controllers/usersController')
const notesController = require('../controllers/notesController')
const authController = require('../controllers/authController')
const { authenticateJWT, logout } = require('../middleware/authenticate')

// return home page
router.get('^/$|/index(.html)?',(req,res) => {
    res.sendFile(path.join(__dirname,'..','views','index.html'))
})

// login, validate-token, logout 
router.route('/login').post(authController.login)
router.post('/validate-token', (req, res, next) => {
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
router.post('/logout',logout);

// users route
router.route('/users')
    .get(authenticateJWT,userController.getAllUsers)
    .post(authenticateJWT,userController.createNewUser)
    .patch(authenticateJWT,userController.updateUser)
    .delete(authenticateJWT,userController.deleteUser)
router.post('/getUser', authenticateJWT,userController.getUser);

// notes(requests) routes
router.route('/notes')
    .get(authenticateJWT,notesController.getuserNotes)
    .post(authenticateJWT,notesController.createNewNote)
    .patch(authenticateJWT,notesController.updateNote)
    .delete(authenticateJWT,notesController.deleteNote)

module.exports = router