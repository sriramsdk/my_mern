const express = require('express')
const router = express.Router()
const notesController = require('../controllers/notesController')
const { authenticateJWT } = require('../middleware/authenticate')

router.route('/')
    .get(authenticateJWT,notesController.getuserNotes)
    .post(authenticateJWT,notesController.createNewNote)
    .patch(authenticateJWT,notesController.updateNote)
    .delete(authenticateJWT,notesController.deleteNote)

module.exports = router