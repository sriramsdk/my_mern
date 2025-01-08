const express = require('express')
const router = express.Router()
const userController = require('../controllers/usersController')
const { authenticateJWT } = require('../middleware/authenticate')

router.route('/')
    .get(authenticateJWT,userController.getAllUsers)
    .post(authenticateJWT,userController.createNewUser)
    .patch(authenticateJWT,userController.updateUser)
    .delete(authenticateJWT,userController.deleteUser)

router.post('/getUser', authenticateJWT,userController.getUser);

module.exports = router