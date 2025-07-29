import { body } from "express-validator";
import Container from "typedi";
import { UserRepository } from "../repositories/user.repository";
import bcrypt from "bcryptjs";

const userRepository = Container.get(UserRepository);

export const updatePasswordValidator = [
    
    body("password").custom(async (value, {req}) => {
        const cookie = req.user
        
        let githubExists
        if(!cookie.id) githubExists = await userRepository.findByEmail(cookie.email)
        if(cookie.id) githubExists = await userRepository.findByGithubId(cookie.id)
        
        if(githubExists?.password){
            if(!value || value.length < 1)throw new Error("Password is required")    
            const isMatch = await bcrypt.compare(value, githubExists?.password)
            if (!isMatch) throw new Error("Password Incorrect");
        }
    }),

    body('new_password', 'The minimum new password length is 8').isLength({ min: 8 }),
    body('new_password', 'new Password is required').not().isEmpty(),
];