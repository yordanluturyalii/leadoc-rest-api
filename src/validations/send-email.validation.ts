import { body } from "express-validator";

export const sendEmailValidator = [
	body("email", "Email is required").not().isEmpty(),
	body("email", "Invalid Email").isEmail(),
];
