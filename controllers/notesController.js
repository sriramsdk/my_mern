const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')

//@desc GET All Notes
//@route GET /notes
//@access Private
const getuserNotes = asyncHandler(async (req, res) => {
    const id = req.user; 

    if (!id) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const notes = await Note.find({ user: id }).lean();
        if (!notes?.length) {
            return res.status(400).json({ message: "No notes available" });
        }

        const notesWithUser = await Promise.all(
            notes.map(async (note) => {
                const user = await User.findById(note.user).lean().exec();
                return { ...note, username: user?.username || "Unknown" };
            })
        );

        res.json(notesWithUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "500", message: "Internal Server Error" });
    }
});


//@desc Create new Notes
//@route POST /notes
//@access Private
const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body
    if(!user || !title || !text){
        return res.status(400).json({ message:"All fields are required" })
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({title}).lean().exec()
    if(duplicate){
        return res.status(400).json({ message:"Duplicate note title" })
    }

    const note = await Note.create({ user,title,text })
    if(note){
        return res.status(201).json({ message:"New note created" })
    }else{
        return res.status(400).json({ message:"Invalid Note data received" })
    }
})

//@desc Update Note
//@route PATCH /notes
//@access Private
const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body
    // Confirm data
    if(!id || !user || !title || !text || typeof completed != "boolean"){
        return res.status(400).json({ message:"All fields are required" })
    }

    // Confirm note exists to update
    const note = await Note.findById(id).exec()
    if(!note){
        return res.status(400).json({ message:"Note not found" })
    }

    // Check for duplicate
    const duplicate = await Note.findOne({title}).lean().exec()
    // Allow renaming the original note
    if(duplicate && duplicate?._id.toString() != id){
        return res.status(400).json({ message:"Duplicate note title" })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed
    const updatedNote = await note.save()

    res.status(200).json({ message:`'${updatedNote.title}' updated` })

})

//@desc Delete Note
//@route Delete /notes
//@access Private
const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body
    if(!id){
        return res.status(400).json({ message: "Note Id required" })
    }

    // confirm note exists
    const note = await Note.findById(id).exec()
    if(!note){
        return res.status(400).json({ message:"Note not found" })
    }

    const result = await Note.deleteOne()
    const reply = `Note '${result.title}' with ID '${result._id}' deleted `
    res.json({ message:reply })
})

module.exports = {
    getuserNotes,createNewNote,updateNote,deleteNote
}