const express = require('express')
const router = express.Router()
const userController = require('../controllers/usersController')

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createNewUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

router.post('/getUser', userController.getUser);

module.exports = router