import { Service } from "typedi";

@Service()
export class CobaServices {
    getAllCoba() {
        return [
            {
                name: "coba1"
            },
            {
                name: "coba2"
            },
            {
                name: "coba3"
            },
        ]
    }
}