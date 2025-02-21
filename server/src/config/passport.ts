import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { PrismaClient } from "@prisma/client";
import passport, { PassportStatic } from "passport";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET as string,
};

export function configurePassport(passport: PassportStatic) {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await prisma.user.findUniqueOrThrow({
          where: { id: jwt_payload.id },
        });

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    })
  );
}

export default passport;