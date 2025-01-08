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
    try{
        const { username, password, roles, type } = req.body

        if(!username || !password || !Array.isArray(roles) || !roles.length){
            return res.status(400).json({ status: "400", message: "All Fields are required" })
        }

        const duplicate = await User.findOne({username}).lean().exec()

        if(duplicate){
            return res.status(400).json({ status: "400", message: "Username Already exists" })
        }
        
        // Hash password
        const hashedPwd = await bcrypt.hash(password,10) // salt rounds

        const userObject = { username, "password":hashedPwd, roles }

        const user = await User.create(userObject)

        if(user){
            if(!type){
                res.status(200).json({ status: "200", message: `New User ${username} created` })
            }else{
                const payload = { user:{ id: user.id } }
                const user_details = { user:{ id: user._id, username: user.username, role: user.roles } }
                jwt.sign(payload, secretkey, { expiresIn: 3600 }, 
                (err, token) => {
                    if (err) throw err;
                    resstatus(200).json({ status: "200", message: "Registered Successfully", token, user_details });
                });
            }
            
        }else{
            res.status(400).json({ message: "Invalid user data received" })
        }
    }catch(error){
        console.log('User error',error)
        res.status(500).json({ status: "500", message: "Something went wrong" })
    }

})

//@desc Update a user
//@route PATCH /users
//@access Private
const updateUser = asyncHandler(async (req, res) => {
    try{
        const { id, username, roles, active, password } = req.body

        if(!id || !username || !Array.isArray(roles) || !roles?.length || typeof active !== 'boolean'){
            return res.status(400).json({ status: "400", message: "All fields are required" })
        }

        const user = await User.findById(id).exec()
        
        if(!user){
            return res.status(400).json({ status: "400", message: "User not found" })
        }

        const duplicate = await User.findOne({ username }).lean().exec()

        if(duplicate && duplicate?._id.toString() !== id){
            return res.status(400).json({ status: "400", message: "Duplicate Username" })
        }

        user.username = username
        user.roles = roles
        user.active = active
        if(password){
            user.password = await bcrypt.hash(password,10) // salt rounds
        }

        const updateUser = await user.save()

        res.status(200).json({ status:"200", message: `${updateUser.username} updated` })
    }catch(error){
        console.log('User error',error)
        res.status(500).json({ status: "500", message: "Something went wrong" })
    }
})

//@desc Delete a user
//@route DELETE /users
//@access Private
const deleteUser = asyncHandler(async (req, res) => {
    try{
        const { id } = req.body
        if(!id){
            return res.status(400).json({ status: "400", message:"UserId is required" })
        }

        const note = await Note.findOne({ user: id }).lean().exec()
        if(note){
            return res.status(400).json({ status: "400", message:"User has assigned notes" })
        }

        const user = await User.findById(id).exec()
        if(!user){
            return res.status(400).json({ status: "400", message:"User not found" })
        }

        // Store user information before deletion
        const { username, _id } = user;

        // Delete the user
        await user.deleteOne();

        // Create a reply using the stored information
        const reply = `Username ${username} deleted`;

        res.status(200).json({ status: "200", message: reply });
    }catch(error){
        console.log('User error',error)
        res.status(500).json({ status: "500", message: "Something went wrong" })
    }
})

const getUser = asyncHandler(async (req, res) => {
    try{
        const { id } = req.body;
        if(!id){
            return res.status(400).json({ status: "400", message:"UserId is required" })
        }

        const user = await User.findById(id).lean().exec();
        if(!user){
            return res.status(400).json({ status: "400", message: "User not found" });
        }

        return res.status(200).json({status: "200", data : user});

    }catch(err){
        console.log('User error',err)
        return res.status(500).json({status: "500", message: "Something went wrong"});
    }
    // return res.status(200).json(req)
});

module.exports = {
    getAllUsers,createNewUser,updateUser,deleteUser,getUser
}