const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const secretkey = process.env.SECRETKEY

const login = asyncHandler(async( req, res ) => {
    try{
        const { username, password } = req.body

        if(!username || !password){
            return res.status(400).json({ status: "400", message: "Username, Password are required" })
        }

        const user = await User.findOne({ username }).lean().exec()
        if(user){
            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch){
                return res.status(400).json({ status: "400", message: "Invalid Credentials" })
            }

            const payload = { user:{ id: user._id } }
            const user_details = { user:{ id: user._id, username: user.username, role: user.roles } }
            jwt.sign(payload, secretkey, { expiresIn: 3600 }, 
            (err, token) => {
                if (err) throw err;
                res.json({ status: "200", message: "Login successfull", token, user_details});
            });
        }else{
            return res.status(409).json({ status: "409", message: "User not exists please resgiter" })
        }
    }catch(error){
        console.log("Login error",error)
        res.status(500).json({ status: "500", message: "Something went wrong" })
    }
    // console.log(user);
})

module.exports = { login }
