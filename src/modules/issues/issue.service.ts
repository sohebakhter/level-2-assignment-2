import { pool } from "../../db/db";
import type { IIssue } from "./issue.interface";

const createIssueIntoDB = async (payload: IIssue, reporter_id: number) => {
    const { title, description, type, status } = payload;

    if (!title || title.trim() === "" || !description || description.trim() === "" || !type) {
        throw new Error("Issue title, description, and type are required");
    }

    if (description.trim().length < 20) {
        throw new Error("Issue description must be at least 20 characters");
    }

    const result = await pool.query(
        "INSERT INTO issues(title, description, type, status, reporter_id) VALUES($1, $2, $3, COALESCE($4, 'open'), $5) RETURNING *",
        [title, description, type, status, reporter_id],
    );

    return result.rows[0];
};

export const issueService = { createIssueIntoDB };