import { body } from "express-validator";

export const resetPasswordValidator = [
	body("email", "Email is required").not().isEmpty(),
	body("email", "Invalid Email").isEmail(),
	body("new_password", "New password is required").not().isEmpty(),
	body(
		"new_password",
		"New password must be at least 8 characters long",
	).isLength({ min: 8 }),
	body("token", "Token is required").not().isEmpty(),
	body("token", "Invalid token format").isString(),
];
