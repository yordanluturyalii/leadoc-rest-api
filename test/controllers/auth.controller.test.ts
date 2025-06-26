import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AuthServices } from "../../src/services/auth.services";
import { AuthController } from "../../src/controllers/auth.controllers";
import { validationResult } from "express-validator";
import { successResponse } from "../../src/utils/response.utils";

const mockAuthorize = vi.fn();
const mockRegister = vi.fn();
const mockAuthService: Partial<AuthServices> = {
  authorize: mockAuthorize,
  register: mockRegister
};

const mockRes = {
  status: vi.fn(() => mockRes),
  json: vi.fn(),
};

vi.mock(import("express-validator"), async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    validationResult: vi.fn()
  }
});

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
      "https://example.com/avatar.jpg",
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

  it("should return 200 and user data if register is succesfull", async () => {
    const mockResult = {
      user: {
        name: "budi",
        email: "budi@gmail.com",
      },
      token: "jwt-token-123",
    };

    vi.mocked(validationResult).mockReturnValue({
      isEmpty: () => true,
    } as any);

    mockRegister.mockResolvedValueOnce(mockResult);

    const mockReq: any = {
      body: {
        name: "budi",
        email: "budi@gmail.com",
        password: "Budi1234",
        password_confirmation: "Budi1234",
      }
    };

    await controller.register(mockReq as any, mockRes as any);

    expect(mockRegister).toHaveBeenCalledWith(
      "budi",
      "budi@gmail.com",
      "Budi1234",
      "Budi1234"
    );

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Success Create Account",
      data: mockResult,
      error: null,
    })
  })
});
