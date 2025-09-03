import {
  createUserService,
  LoginService,
  getUsersService,
} from "../services/user.service.js";
export const createUser = async (req, res, next) => {
  const { email, name, password } = req.body;
  try {
    const user = await createUserService(email, name, password);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email);
  try {
    const { token, user } = await LoginService(email, password);
    res.status(200).json({ token, user });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await getUsersService();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
