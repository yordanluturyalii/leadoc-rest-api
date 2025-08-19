import type { InferInsertModel } from "drizzle-orm";
import { orders } from "../db/schema";
import { db } from "../db/db";

export class OrderRepository {
    async save(data: InferInsertModel<typeof orders>) {
        try {
            await db.insert(orders).values(data);
        } catch (error) {
            return error;
        }
    }
}