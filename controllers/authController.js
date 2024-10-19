const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const secretkey = process.env.SECRETKEY

const login = asyncHandler(async( req, res ) => {
    const { username, password } = req.body

    if(!username || !password){
        return res.status(400).json({ message: "Username, Password are required" })
    }

    const user = await User.findOne({ username }).lean().exec()
    if(user){
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        const payload = { user:{ id: user.id } }
        const user_details = { user:{ username: user.username, role: user.roles } }
        jwt.sign(payload, secretkey, { expiresIn: 3600 }, 
        (err, token) => {
            if (err) throw err;
            res.json({ token, user_details});
        });
    }else{
        return res.status(409).json({ message: "User not exists please resgiter" })
    }
    // console.log(user);
})

module.exports = { login }
