export class Repository {
  constructor(
    public id: string | null,
    public name: string,
    public visibility: boolean,
    public userId: string | null,
    public haveReadme: boolean,
    public createdAt: Date | null,
    public updatedAt: Date | null
  ) {}
}
