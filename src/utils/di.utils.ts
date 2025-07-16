import Container from "typedi";
import { AuthServices } from "../services/auth.services";
import { ProfileServices } from "../services/profile.services";
import { UserRepository } from "../repositories/user.repository";
import { RepositoryServices } from "../services/repository.services";

export default function setupDI() {
  Container.set("UserRepository", new UserRepository());

  Container.set(
    "AuthService",
    new AuthServices(Container.get("UserRepository")),
  );

  Container.set(
    "ProfileService",
    new ProfileServices(Container.get("UserRepository")),
  );

  Container.set(
    "RepositoryService",
    new RepositoryServices(Container.get("UserRepository")),
  );
}
