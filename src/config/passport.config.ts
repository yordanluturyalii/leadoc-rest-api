import passport, { use } from "passport";
import { Strategy as GithubStrategy, type Profile } from "passport-github2";
import { config } from "./config";
import { logger } from "../utils/logger.utils";
import Container from "typedi";
import { AuthServices } from "../services/auth.services";

passport.serializeUser((user: Express.User, done) => {
  done(null, user);
});

passport.deserializeUser(function (user: Express.User, done) {
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
      refreshToken: string,
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
      
      const authService = Container.get(AuthServices);
      authService.authorize(user.id, user.accessToken, user.name, undefined, user?.photo_profile[0]?.value, user.username)

      return done(null, user);
    },
  ),
);
