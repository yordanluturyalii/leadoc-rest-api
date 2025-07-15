import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthServices } from "../../src/services/auth.services";
import type { UserRepository } from "../../src/repositories/user.repository";
import { User } from "../../src/db/models/user.model";
import bcrypt from "bcrypt";

const mockUserRepository = {
  findByGithubId: vi.fn(),
  create: vi.fn(),
  findByEmail: vi.fn()
};

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

vi.mock("../../src/config/config", () => ({
  config: {
    jwtSecret: "test-secret-key",
  },
}));

vi.mock("../../src/utils/logger.utils", () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock("typedi", () => ({
  Service: () => (target: any) => target,
  Inject:
    () => (target: any, propertyKey: string, parameterIndex: number) => { },
  Container: {
    get: vi.fn(),
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
  },
}));


import jwt from "jsonwebtoken";
import { logger } from "../../src/utils/logger.utils";

describe("AuthServices", () => {
  let authServices: AuthServices;
  let jwtSignSpy: any;
  let loggerErrorSpy: any;

  const mockUserData = {
    id: "user-123",
    name: "John Doe",
    username: "johndoe",
    github_id: "github-123",
    profile_picture: "https://example.com/avatar.jpg",
  };

  const authData = {
    githubId: "github-123",
    username: "johndoe",
    accessToken: "access-token-123",
    name: "John Doe",
    profile_picture: "https://example.com/avatar.jpg",
  };

  beforeEach(() => {
    authServices = new AuthServices(mockUserRepository as any);

    jwtSignSpy = vi.mocked(jwt.sign);
    loggerErrorSpy = vi.mocked(logger.error);

    vi.clearAllMocks();
  });

  describe("authorize", () => {
    it("should return JWT token when user exists", async () => {
      const expectedToken = "jwt-token-123";

      const existingUser = new User(
        mockUserData.id,
        mockUserData.name,
        mockUserData.username,
        mockUserData.profile_picture,
        mockUserData.github_id,
      );
      mockUserRepository.findByGithubId.mockResolvedValue(existingUser);

      jwtSignSpy.mockReturnValue(expectedToken);

      // Add await here - the method might be async
      const result = await authServices.authorize(
        authData.githubId,
        authData.username,
        authData.accessToken,
        authData.name,
        authData.profile_picture,
      );

      expect(mockUserRepository.findByGithubId).toHaveBeenCalledWith(
        authData.githubId,
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(jwtSignSpy).toHaveBeenCalledWith(
        {
          githubId: authData.githubId,
          username: authData.username,
          accessToken: authData.accessToken,
        },
        "test-secret-key",
        { expiresIn: "7d" },
      );
      expect(result).toBe(expectedToken);
    });

    it("should create new user and return JWT token when user does not exist", async () => {
      const expectedToken = "jwt-token-456";

      // Mock user does not exist
      mockUserRepository.findByGithubId.mockResolvedValue(null);

      // Mock user creation
      mockUserRepository.create.mockResolvedValue(undefined);

      // Mock JWT sign
      jwtSignSpy.mockReturnValue(expectedToken);

      // Add await here - the method might be async
      const result = await authServices.authorize(
        authData.githubId,
        authData.username,
        authData.accessToken,
        authData.name,
        authData.profile_picture,
      );

      // Verify user lookup was called
      expect(mockUserRepository.findByGithubId).toHaveBeenCalledWith(
        authData.githubId,
      );

      // Verify user creation was called with correct parameters
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        authData.name,
        authData.username,
        authData.githubId,
        authData.profile_picture,
        undefined,
        authData.accessToken,
      );

      // Verify JWT token generation
      expect(jwtSignSpy).toHaveBeenCalledWith(
        {
          githubId: authData.githubId,
          username: authData.username,
          accessToken: authData.accessToken,
        },
        "test-secret-key",
        { expiresIn: "7d" },
      );

      expect(result).toBe(expectedToken);
    });
  });

  it("should create new user and return detail user and JWT token", async () => {
    const expectedToken = "jwt-token-456";
    const hashedPassword = "hashed-budi1234";

    const input = {
      name: "budi",
      email: "budi@gmail.com",
      password: "Budi1234",
      passwordConfirmation: "Budi1234",
    };

    // Simulasi tidak ada user dengan email tsb
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);

    // Simulasi hash password
    vi.mocked(bcrypt.hash).mockResolvedValueOnce(hashedPassword);

    // Simulasi token
    jwtSignSpy.mockReturnValue(expectedToken);

    // Simulasi user berhasil disimpan
    mockUserRepository.create.mockResolvedValueOnce({
      id: "user-999",
      name: input.name,
      email: input.email,
    });

    const result = await authServices.register(
      input.name,
      input.email,
      input.password,
      input.passwordConfirmation
    );

    expect(bcrypt.hash).toHaveBeenCalledWith(input.password, 10);

    expect(jwtSignSpy).toHaveBeenCalledWith(
      {
        name: input.name,
        email: input.email,
        hashPassword: hashedPassword,
      },
      "test-secret-key",
      { expiresIn: "7d" }
    );

    expect(mockUserRepository.create).toHaveBeenCalledWith(
      input.name,
      input.email,
      undefined,
      undefined,
      undefined,
      hashedPassword,
      undefined
    );

    expect(result).toEqual({
      user: {
        name: input.name,
        email: input.email,
      },
      token: expectedToken,
    });

  })

  it("should return error when password and confirmation do not match", async () => {
    const result = await authServices.register(
      "Jane",
      "jane@example.com",
      "1234",
      "4321"
    );

    expect(result).toBeInstanceOf(Error);
    expect(result?.message).toBe("The password confirmation does not match.");
  })

  it("should return error when email already taken", async () => {
    const input = {
      name: "budi",
      email: "budi@gmail.com",
      password: "Budi1234",
      passwordConfirmation: "Budi1234",
    };

    // Simulasikan bahwa email sudah terdaftar
    mockUserRepository.findByEmail = vi.fn().mockResolvedValueOnce({
      id: "user-1",
      name: input.name,
      email: input.email,
    });

    const result = await authServices.register(
      input.name,
      input.email,
      input.password,
      input.passwordConfirmation
    );

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Email already taken");
    expect(logger.error).toHaveBeenCalledWith("Error: %o", expect.any(Error));
  });


  it("should catch unexpected errors and log them", async () => {
    mockUserRepository.create.mockRejectedValueOnce(new Error("DB error"));

    const result = await authServices.register(
      "Joe",
      "joe@example.com",
      "123456",
      "123456"
    );

    expect(result).toBeInstanceOf(Error);
    expect(result?.message).toBe("DB error");
    expect(logger.error).toHaveBeenCalledWith("Error: %o", expect.any(Error));
  })
});
