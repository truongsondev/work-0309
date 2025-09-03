import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
configDotenv();
export const verfifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new Error("No token provided");
    }
    const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      throw new Error("Invalid token");
    }
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
