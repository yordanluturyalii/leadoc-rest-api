export class User {
  constructor(
    public id: string | undefined,
    public name: string | undefined,
    public username: string | undefined,
    public profile_picture: string | null | undefined,
    public github_id: string | undefined,
  ) {}
}
