import { body } from "express-validator";
import Container from "typedi";
import { UserRepository } from "../repositories/user.repository";

const userRepository = Container.get(UserRepository);

export const updateProfileValidator = [
	body("name", "Name is required").not().isEmpty(),
	body("email", "Invalid Email").isEmail(),
	body("email", "Email is required").not().isEmpty(),
	body("email").custom(async (value) => {
		const existingEmail = await userRepository.findByEmail(value);
		if (existingEmail)
			throw new Error("This email is linked to an existing user.");
	}),
];
