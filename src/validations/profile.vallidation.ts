import { body } from "express-validator";
import Container from "typedi";
import { UserRepository } from "../repositories/user.repository";
import { logger } from "../utils/logger.utils";

const userRepository = Container.get(UserRepository);

export const profileValidator = [
    body('password', 'Password is required').not().isEmpty(),
];