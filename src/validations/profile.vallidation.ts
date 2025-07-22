import { body } from "express-validator";
import Container from "typedi";
import { UserRepository } from "../repositories/user.repository";
import { logger } from "../utils/logger.utils";

const userRepository = Container.get(UserRepository);

export const profileValidator = [
    body("password_confirmation", "Password confirmation is required").not().isEmpty(),
    body('password', 'Password is required').not().isEmpty(),
    body('password').custom((value, { req }) => {
        if (value !== req.body.password_confirmation) throw new Error("The password and password confirmation does not match.");
        return true;
    }),
];