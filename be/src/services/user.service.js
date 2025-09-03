import prisma from "../utils/prisma-client.util.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { configDotenv } from "dotenv";
configDotenv();
export const createUserService = async (email, name, password) => {
  const userExists = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (userExists) {
    throw new Error("User already exists");
  }
  const passwordHash = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      email,
      name,
      password: passwordHash,
    },
  });
};

export const LoginService = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Password is incorrect");
  }
  const payload = {
    id: user.id,
    email: user.email,
  };
  const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
  const token = jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
  return { token, user };
};

export const getUsersService = async () => {
  return await prisma.user.findMany({
    omit: {
      password: true,
    },
  });
};
