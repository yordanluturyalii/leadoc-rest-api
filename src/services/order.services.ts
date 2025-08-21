import { Inject, Service } from "typedi";
import { UserRepository } from "../repositories/user.repository";
import { prices } from "../utils/constant.util";
import type { OrderRepository } from "../repositories/order.repository";
import { config } from "../config/config";
import { randomUUID } from "crypto";
import { generateDigest, generateSignature } from "../utils/helpers.util";
import axios from "axios";
import { logger } from "../utils/logger.utils";

@Service()
export class OrderServices {
    constructor(
        @Inject("UserRepository") public userRepository: UserRepository,
        @Inject("OrderRepository") public orderRepository: OrderRepository
    ) { }

    async pay(githubId: string, packageName: "MINI" | "MEDIUM" | "MEGA") {
        try {
            const user = await this.userRepository.findByGithubId(githubId);
            if (!user) throw new Error("Unauthorized");

            let amount = 0;
            switch (packageName.toUpperCase()) {
                case "MINI":
                    amount += prices.MINI;
                    break;
                case "MEDIUM":
                    amount += prices.MEDIUM;
                    break;
                case "MEGA":
                    amount += prices.MEGA;
                    break;
                default:
                    throw new Error("Package Not Found");
            }

            const invoice = "INV-" + new Date().toISOString() + user?.id;

            const body = {
                order: {
                    invoice_number: invoice,
                    amount: amount,
                    callback_url: config.host + "/api/payment/notify",
                    auto_redirect: false,
                    session_id: randomUUID()
                },
                customer: {
                    id: user?.id,
                    name: user?.name,
                    email: user?.email,
                },
                override_configuration: {
                    themes: {
                        language: "ID",
                        background_color: "",
                        font_color: "",
                        button_background_color: "",
                        button_font_color: ""
                    }
                }
            }

            let digest = generateDigest(JSON.stringify(body));

            const requestId = crypto.randomUUID();
            const timestamp = new Date().toISOString().slice(0, 19)+"Z";
            let headerSignature = generateSignature(config.dokuClient, requestId, timestamp, "/credit-card/v1/payment-page", digest, config.dokuSecret);

            const order = await axios.post("https://api-sandbox.doku.com/credit-card/v1/payment-page", body, {
                headers: {
                    "Client-Id": config.dokuClient,
                    "Request-Id": requestId,
                    "Request-Timestamp": timestamp,
                    "Signature": headerSignature
                }
            });

            await this.orderRepository.save({
                invoice: invoice,
                amount: amount,
                package_name: packageName,
                user_id: user?.id as string,
                date: new Date().toISOString()
            });

            logger.info("From Order Services - Order: %o", order);
            return order.data?.credit_card_payment_page?.url;
        } catch (error) {
            logger.error("Payment Service - Error: %o", error);
            return error;
        }
    }
}