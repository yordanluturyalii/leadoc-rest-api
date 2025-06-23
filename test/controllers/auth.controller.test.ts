import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AuthServices } from "../../src/services/auth.services";
import { AuthController } from "../../src/controllers/auth.controllers";

const mockAuthorize = vi.fn();
const mockAuthService: Partial<AuthServices> = {
    authorize: mockAuthorize,
};

const mockRes = {
    status: vi.fn(() => mockRes),
    json: vi.fn(),
};

describe("AuthController - authorize", () => {
    let controller: AuthController;

    beforeEach(() => {
        vi.clearAllMocks();
        controller = new AuthController(mockAuthService as AuthServices);
    });

    it("should return token if authorize is successful", async () => {
        const mockToken = "jwt-token-123";
        mockAuthorize.mockResolvedValueOnce(mockToken);

        const mockReq: any = {
            session: {
                user: {
                    id: "123",
                    username: "johndoe",
                    name: "John Doe",
                    accessToken: "token-abc",
                    profile_picture: "https://example.com/avatar.jpg",
                },
            },
        };

        await controller.authorize(mockReq, mockRes as any);

        expect(mockAuthorize).toHaveBeenCalledWith(
            "123",
            "johndoe",
            "token-abc",
            "John Doe",
            "https://example.com/avatar.jpg"
        );

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: "Success Authorize",
            data: {
                token: mockToken,
            },
            error: null,
        });
    });

    it("should handle error and return 500 when authorize throws", async () => {
        const error = new Error("Authorization failed");
        mockAuthorize.mockImplementationOnce(() => {
            throw error;
        });

        const mockReq: any = {
            session: {
                user: {
                    id: "123",
                    username: "johndoe",
                    name: "John Doe",
                    accessToken: "token-abc",
                    profile_picture: "https://example.com/avatar.jpg",
                },
            },
        };

        await controller.authorize(mockReq, mockRes as any);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: "Failed To Authorize",
            data: null,
            error: {
                message: error.message,
                trace: error.stack,
            },
        });
    });
});
