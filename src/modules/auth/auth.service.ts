import bcrypt from "bcryptjs";
import { pool } from "../../db/db";
import type { IUser } from "./auth.interface";
import jwt from "jsonwebtoken";
import config from "../../config";

const registerUserIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  const user = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (user.rows.length > 0) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    "INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, COALESCE($4, 'contributor')) RETURNING *",
    [name, email, hashedPassword, role],
  );

  delete result.rows[0].password;
  return result;
};

const loginUserIntoDB = async (payload: IUser) => {
  const { email, password } = payload;

  const user = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (user.rows.length === 0) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const jwtPayload = { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role };

  //creating token while login
  const accessToken = jwt.sign(jwtPayload, config.secret, { expiresIn: "1d" });

  delete user.rows[0].password;

  return { token: accessToken, user: user.rows[0], };
};

export const authService = {
  registerUserIntoDB,
  loginUserIntoDB
};
