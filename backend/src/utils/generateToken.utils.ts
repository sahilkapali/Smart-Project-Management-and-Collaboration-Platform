import jwt from "jsonwebtoken";
import { IJwtPayload } from "../types/global.types";
import { ENV_CONFIG } from "../config/env";

export const signAccessToken = (payload: IJwtPayload) => {
  return jwt.sign(payload, ENV_CONFIG.jwt_secret, {
    expiresIn: ENV_CONFIG.jwt_expires_in as any,
  });
};

export const verifyToken = (token: string) => {
  type JwtPayloadReturn = IJwtPayload & {
    exp: number;
    iat: number;
  };

  return jwt.verify(token, ENV_CONFIG.jwt_secret) as JwtPayloadReturn;
};