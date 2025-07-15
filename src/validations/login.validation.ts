import { body } from "express-validator";
import Container from "typedi";
import { UserRepository } from "../repositories/user.repository";
import bcrypt from "bcryptjs";

const userRepository = Container.get(UserRepository);

export const loginValidator = [
    body("email", "Invalid Email").isEmail(),
    body("email", "Email is required").not().isEmpty(),
    body("email").custom(async (value) => {
        const existingEmail = await userRepository.findByEmail(value);
        if (!existingEmail) throw new Error("This email must be in the correct format and linked to an existing user.");
    }),
    body('password', 'The minimum password length is 8').isLength({ min: 8 }),
    body('password', 'Password is required').not().isEmpty(),
    body("password").custom(async (value, {req}) => {
        const passwordHash = await userRepository.findByEmail(req.body.email);
        const isMatch = await bcrypt.compare(value, passwordHash?.password)
        if (!isMatch) throw new Error("Password Incorrect");
    }),
];