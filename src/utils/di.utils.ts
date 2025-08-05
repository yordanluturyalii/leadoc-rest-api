import Container from "typedi";
import { RepoRepository } from "../repositories/repo.repository";
import { UserRepository } from "../repositories/user.repository";
import { AuthServices } from "../services/auth.services";
import { ProfileServices } from "../services/profile.services";
import { RepositoryServices } from "../services/repository.services";

export default function setupDI() {
	Container.set("UserRepository", new UserRepository());

	Container.set(
		"AuthService",
		new AuthServices(Container.get("UserRepository")),
	);

	Container.set("RepoRepository", new RepoRepository());
	Container.set(
		"ProfileService",
		new ProfileServices(Container.get("UserRepository")),
	);

	Container.set(
		"RepositoryService",
		new RepositoryServices(
			Container.get("UserRepository"),
			Container.get("RepoRepository"),
		),
	);
}
