import { body } from "express-validator";

export const profileValidator = [
	body("password", "Password is required").not().isEmpty(),
];
