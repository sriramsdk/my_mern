const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const secretkey = process.env.SECRETKEY

//@desc GET All users
//@route GET /users
//@access Private
const getAllUsers = asyncHandler(async (req, res) => {
    try{
        const users = await User.find().select('-password').lean()

        if(!users?.length){
            return res.status(400).json({ message: 'No Users Found' })
        }
        res.json(users)
    } catch (err) {
        if (err instanceof AggregateError) {
            console.log("Cause of the error:", err.cause);
        }
    }
    
})

//@desc Create new user
//@route POST /users
//@access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles, type } = req.body

    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({ message: "All Fields are required" })
    }

    const duplicate = await User.findOne({username}).lean().exec()

    if(duplicate){
        return res.status(409).json({ message: "Username Already exists" })
    }
    
    // Hash password
    const hashedPwd = await bcrypt.hash(password,10) // salt rounds

    const userObject = { username, "password":hashedPwd, roles }

    const user = await User.create(userObject)

    if(user){
        if(!type){
            res.status(201).json({ message: `New User ${username} created` })
        }else{
            const payload = { user:{ id: user.id } }
        
            jwt.sign(payload, secretkey, { expiresIn: 3600 }, 
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
        }
        
    }else{
        res.status(400).json({ message: "Invalid user data received" })
    }

})

//@desc Update a user
//@route PATCH /users
//@access Private
const updateUser = asyncHandler(async (req, res) => {
    const { id, username, roles, active, password } = req.body

    if(!id || !username || !Array.isArray(roles) || !roles?.length || typeof active !== 'boolean'){
        return res.status(400).json({ message: "All fields are required" })
    }

    const user = await User.findById(id).exec()
    
    if(!user){
        return res.status(400).json({ message: "User not found" })
    }

    const duplicate = await User.findOne({ username }).lean().exec()

    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(400).json({ message: "Duplicate Username" })
    }

    user.username = username
    user.roles = roles
    user.active = active
    if(password){
        user.password = await bcrypt.hash(password,10) // salt rounds
    }

    const updateUser = await user.save()

    res.json({ message: `${updateUser.username} updated` })
    
})

//@desc Delete a user
//@route DELETE /users
//@access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body
    if(!id){
        return res.status(400).json({ message:"UserId is required" })
    }

    const note = await Note.findOne({ user: id }).lean().exec()
    if(note){
        return res.status(400).json({ message:"User has assigned notes" })
    }

    const user = await User.findById(id).exec()
    if(!user){
        return res.status(400).json({ message:"User not found" })
    }

    // Store user information before deletion
    const { username, _id } = user;

    // Delete the user
    await user.deleteOne();

    // Create a reply using the stored information
    const reply = `Username ${username} deleted`;

    res.status(200).json({ message: reply });
})

const getUser = asyncHandler(async (req, res) => {
    try{
        const { id } = req.body;
        if(!id){
            return res.status(400).json({ message:"UserId is required" })
        }

        const user = await User.findById(id).lean().exec();
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }

        return res.status(200).json({data : user});

    }catch(err){
        return res.status(500).json({message: err});
    }
    // return res.status(200).json(req)
});

module.exports = {
    getAllUsers,createNewUser,updateUser,deleteUser,getUser
}