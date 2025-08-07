import passport from "passport";
import { Strategy as GithubStrategy, type Profile } from "passport-github2";
import Container from "typedi";
import { AuthServices } from "../services/auth.services";
import { config } from "./config";

passport.serializeUser((user: Express.User, done) => {
	done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
	done(null, user);
});

passport.use(
	new GithubStrategy(
		{
			clientID: config.githubClientId,
			clientSecret: config.githubSecretId,
			callbackURL: config.githubCallbackUrl,
		},
		(
			accessToken: string,
			_refreshToken: string,
			profile: Profile,
			done: any,
		) => {
			const user = {
				id: profile.id,
				name: profile.displayName,
				username: profile.username,
				photo_profile: profile.photos,
				accessToken,
			};

			const profilePicture =
				Array.isArray(user.photo_profile) && user.photo_profile.length > 0
					? user.photo_profile?.[0]?.value
					: "";

			const authService = Container.get(AuthServices);
			authService.authorize(
				user.id,
				user.accessToken,
				user.name,
				undefined,
				profilePicture,
				user.username,
			);

			return done(null, user);
		},
	),
);
