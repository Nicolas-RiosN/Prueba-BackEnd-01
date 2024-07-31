import User from '../models/user.model.js';
import bcryptjs from "bcryptjs";
import { createAccessToken } from '../libs/jwt.js';
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';

export const register = async (req, res) => {
    const {first_name, last_name, email, age, password, role} = req.body

    try {

        const passwordHash = await bcryptjs.hash(password, 10)
        const newUser = new User({
            first_name,
            last_name,
            email,
            password: passwordHash,
            age,
            role
        })
    
        const userSaved = await newUser.save();
        
        const token = await createAccessToken({id:userSaved._id})
        res.cookie('token', token)
        res.json({
            id: userSaved._id,
            first_name:userSaved.first_name,
            last_name:userSaved.last_name,
            email:userSaved.email,
            age:userSaved.age,
        })

        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}; 

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userFound = await User.findOne({ email });
        if (!userFound) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcryptjs.compare(password, userFound.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

        const token = jwt.sign({ id: userFound._id }, TOKEN_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        res.json({
            id: userFound._id,
            first_name: userFound.first_name,
            last_name: userFound.last_name,
            email: userFound.email,
            age: userFound.age,
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const logout = (req, res) =>{
    res.cookie('token', "",{
        expires: new Date(0)
    })
    return res.sendStatus(200)
}

export const profile = async (req, res) => {
    try {
        console.log('User from request:', req.user);

        const userFound = await User.findById(req.user._id);
        console.log(`Searching for user with ID: ${req.user._id}`);

        if (!userFound) {
            return res.status(400).json({ message: "User not found" });
        }

        return res.json({
            id: userFound._id,
            first_name: userFound.first_name,
            last_name: userFound.last_name,
            email: userFound.email,
        });
    } catch (error) {
        console.error('Profile error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};