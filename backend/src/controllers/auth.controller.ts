import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../services/auth.service";

/**
 * Register User
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { first_Name, last_Name, email, password, phone } = req.body;

    if (!first_Name || !last_Name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "first_Name, last_Name, email and password are required",
      });
    }

    const result = await registerUser({
      first_Name,
      last_Name,
      email,
      password,
      phone,
    });

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Login User
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const result = await loginUser({
      email,
      password,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Logout User
 * (If you are using Bearer token, logout is handled on the client side)
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};