import { body } from "express-validator";
import Container from "typedi";
import { UserRepository } from "../repositories/user.repository";

const userRepository = Container.get(UserRepository);

export const registerValidator = [
    body("email", "Invalid Email").isEmail(),
    body("email", "Email is required").not().isEmpty(),
    body("email").custom(async (value) => {
        const existingEmail = await userRepository.findByEmail(value);
        if (existingEmail) throw new Error("This email must be in the correct format and not linked to an existing user.");
    }),
    body("password_confirmation", "Password confirmation is required").not().isEmpty(),
    body('password_confirmation', 'The minimum password confirmation length is 8').isLength({ min: 8 }),
    body('password', 'The minimum password length is 8').isLength({ min: 8 }),
    body('password', 'Password is required').not().isEmpty(),
    body('password').custom((value, { req }) => {
        if (value !== req.body.password_confirmation) throw new Error("The password confirmation does not match.");
        return true;
    }),
];