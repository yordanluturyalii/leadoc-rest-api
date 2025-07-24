export class User {
  constructor(
    public id: string | undefined,
    public name: string | undefined,
    public email: string | undefined,
    public username: string | undefined,
    public profile_picture: string | null | undefined,
    public github_id: string | undefined,
    public password: string | undefined,
    public accessToken: string | undefined,
    public coin: number | undefined
  ) {}
}
