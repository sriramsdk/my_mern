const express = require('express')
const router = express.Router()
const notesController = require('../controllers/notesController')
const { authenticateJWT } = require('../middleware/authenticate')

router.route('/')
    .get(authenticateJWT,notesController.getuserNotes)
    .post(notesController.createNewNote)
    .patch(notesController.updateNote)
    .delete(notesController.deleteNote)

module.exports = router