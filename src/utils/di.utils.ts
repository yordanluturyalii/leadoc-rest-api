import Container from "typedi";
import { AuthServices } from "../services/auth.services";
import { UserRepository } from "../repositories/user.repository";

export default function setupDI() {
    Container.set("UserRepository", new UserRepository());
    Container.set("AuthService", new AuthServices(
        Container.get("UserRepository")
    ));
}