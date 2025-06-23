import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthServices } from "../../src/services/auth.services";
import type { UserRepository } from "../../src/repositories/user.repository";
import { User } from "../../src/db/models/user.model";

const mockUserRepository = {
  findByGithubId: vi.fn(),
  create: vi.fn(),
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
    () => (target: any, propertyKey: string, parameterIndex: number) => {},
  Container: {
    get: vi.fn(),
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
});
