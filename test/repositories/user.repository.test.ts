import { beforeEach, describe, expect, it, vi } from "vitest";
import { users } from "../../src/db/schema";
import { UserRepository } from "../../src/repositories/user.repository";
import { User } from "../../src/db/models/user.model";

vi.mock("../../src/db/db", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    delete: vi.fn(),
  },
}));

import { db } from "../../src/db/db";

describe("User Repository", () => {
  let userRepository: UserRepository;

  const mockUserData = {
    id: "1234",
    name: "budi",
    username: "budii",
    github_id: "1234",
    profile_picture: "budi.jpg",
  };

  beforeEach(() => {
    userRepository = new UserRepository();

    const mockValues = vi.fn();
    const mockFrom = vi.fn();
    const mockWhere = vi.fn();

    vi.mocked(db.insert).mockReturnValue({
      values: mockValues,
    } as any);

    vi.mocked(db.select).mockReturnValue({
      from: mockFrom,
    } as any);

    mockFrom.mockReturnValue({
      where: mockWhere,
    });

    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    } as any);

    vi.clearAllMocks();
  });

  it("should create user successfully", async () => {
    const insertMock = vi.mocked(db.insert);
    const valuesMock = insertMock().values;

    valuesMock.mockResolvedValue([]);

    const result = await userRepository.create(
      mockUserData.name,
      mockUserData.username,
      mockUserData.github_id,
      mockUserData.profile_picture
    );

    expect(insertMock).toHaveBeenCalledWith(users);
    expect(valuesMock).toHaveBeenCalledWith({
      name: mockUserData.name,
      username: mockUserData.username,
      github_id: mockUserData.github_id,
      profile_picture: mockUserData.profile_picture,
    });
    expect(result).toBeUndefined();
  });

  it("should find user by id successfully", async () => {
    const selectMock = vi.mocked(db.select);
    const fromMock = selectMock().from;
    const whereMock = fromMock().where;

    whereMock.mockResolvedValue([mockUserData]);

    const result = await userRepository.findByGithubId("1234");

    expect(selectMock).toHaveBeenCalled();
    expect(fromMock).toHaveBeenCalled();
    expect(whereMock).toHaveBeenCalled();

    expect(result).toBeInstanceOf(User);
    expect(result?.id).toBe(mockUserData.id);
    expect(result?.name).toBe(mockUserData.name);
    expect(result?.username).toBe(mockUserData.username);
  });

  it("should return null when user not found", async () => {
    const selectMock = vi.mocked(db.select);
    const fromMock = selectMock().from;
    const whereMock = fromMock().where;

    whereMock.mockResolvedValue([]);

    const result = await userRepository.findByGithubId("non-existent-id");

    expect(result).toBeNull();
    expect(selectMock).toHaveBeenCalled();
    expect(whereMock).toHaveBeenCalled();
  });

  it("should throw error for duplicate key value", async () => {
    const insertMock = vi.mocked(db.insert);
    const valuesMock = insertMock().values;

    const duplicateError = new Error(`Failed query: insert into "users" ("id", "name", "username", "profile_picture", "github_id") values (default, $1, $2, $3, $4) 
params: budi,budii,budi.jpg,1234`);

    valuesMock.mockRejectedValue(duplicateError);

    await expect(
      userRepository.create(
        mockUserData.name,
        mockUserData.username,
        mockUserData.github_id,
        mockUserData.profile_picture
      )
    ).rejects.toThrow(`Failed query: insert into "users" ("id", "name", "username", "profile_picture", "github_id") values (default, $1, $2, $3, $4) 
params: budi,budii,budi.jpg,1234`);

    expect(insertMock).toHaveBeenCalledWith(users);
    expect(valuesMock).toHaveBeenCalledWith({
      name: mockUserData.name,
      username: mockUserData.username,
      github_id: mockUserData.github_id,
      profile_picture: mockUserData.profile_picture,
    });
  });

  it("should handle database connection errors", async () => {
    const insertMock = vi.mocked(db.insert);
    const valuesMock = insertMock().values;

    valuesMock.mockRejectedValue(new Error("Database connection failed"));

    await expect(
      userRepository.create(
        mockUserData.name,
        mockUserData.username,
        mockUserData.github_id,
        mockUserData.profile_picture
      )
    ).rejects.toThrow("Database connection failed");
  });
});