export class User {
	constructor(
		public id: string | undefined,
		public name: string | undefined | null,
		public email: string | undefined | null,
		public username: string | undefined | null,
		public profile_picture: string | null | undefined,
		public github_id: string | undefined | null,
		public password: string | undefined | null,
		public accessToken: string | undefined | null,
		public coin: number | undefined | null,
	) {}
}
