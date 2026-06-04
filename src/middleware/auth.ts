import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import type { NextFunction, Request, Response } from "express";
import { pool } from "../db/db";

const auth = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, config.secret) as JwtPayload;

        const userData = await pool.query("SELECT * FROM users WHERE email = $1", [
            decoded.email,
        ]);

        const user = userData.rows[0];

        if (userData.rows.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (user.role !== 'contributor' && user.role !== 'maintainer') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        req.user = decoded;

        next();
    } catch (error) {

        next(error);

    }
};

export default auth;