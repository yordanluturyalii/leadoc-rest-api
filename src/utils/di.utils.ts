import Container from "typedi";
import { CobaServices } from "../services/coba.services";

export default function setupDI() {
    Container.set("CobaService", new CobaServices());
}