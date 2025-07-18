export class Repository {
  constructor(
    public id: string,
    public name: string,
    public visibility: "PRIVATE" | "PUBLIC",
    public userId: string,
    public createdAt: Date,
    public updatedAt: Date | null
  ) {}
}
