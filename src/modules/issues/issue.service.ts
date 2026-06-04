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

const getAllIssuesFromDB = async ({
    sort = "newest",
    type,
    status,
}: {
    sort?: string;
    type?: string;
    status?: string;
}) => {
    const values: string[] = [];
    const conditions: string[] = [];

    if (type) {
        values.push(type);
        conditions.push(`type = $${values.length}`);
    }

    if (status) {
        values.push(status);
        conditions.push(`status = $${values.length}`);
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const orderBy =
        sort === "oldest"
            ? "created_at ASC"
            : "created_at DESC";

    const issuesResult = await pool.query(
        `
    SELECT *
    FROM issues
    ${whereClause}
    ORDER BY ${orderBy}
    `,
        values
    );

    const issues = issuesResult.rows;

    const reporterIds = [
        ...new Set(
            issues
                .map((issue) => issue.reporter_id)
                .filter(Boolean)
        ),
    ];

    if (!reporterIds.length) {
        return issues;
    }

    const usersResult = await pool.query(
        `
    SELECT id, name, role
    FROM users
    WHERE id = ANY($1)
    `,
        [reporterIds]
    );

    const usersMap = new Map(
        usersResult.rows.map((user) => [user.id, user])
    );

    return issues.map((issue) => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: usersMap.get(issue.reporter_id) || null,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
    }));
};

const getSingleIssueFromDB = async (id: number) => {
    const result = await pool.query("SELECT * FROM issues WHERE id = $1", [id])

    if (result.rows.length === 0) {
        throw new Error("Issue not found");
    }

    const reporterId = result.rows[0].reporter_id;

    if (!reporterId) {
        return result.rows[0];
    }

    const usersResult = await pool.query("SELECT id, name, role FROM users WHERE id = $1", [reporterId]);

    result.rows[0].reporter = usersResult.rows[0];

    delete result.rows[0].reporter_id;

    return {
        id: result.rows[0].id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        type: result.rows[0].type,
        status: result.rows[0].status,
        reporter: result.rows[0].reporter,
        created_at: result.rows[0].created_at,
        updated_at: result.rows[0].updated_at
    }
};

const updateIssueInDB = async (
    issueId: number,
    userId: number,
    role: string,
    payload: IIssue
) => {
    const issueData = await pool.query(
        "SELECT * FROM issues WHERE id = $1",
        [issueId]
    );

    const issue = issueData.rows[0];

    if (!issue) {
        throw new Error("Issue not found");
    }

    if (role !== "maintainer") {
        if (issue.reporter_id !== userId) {
            throw new Error("You can only update your own issues");
        }

        if (issue.status !== "open") {
            throw new Error("Only open issues can be updated");
        }
    }

    const { title, description, type } = payload;

    const result = await pool.query(
        `
    UPDATE issues
    SET
      title = $1,
      description = $2,
      type = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
    `,
        [title, description, type, issueId]
    );

    return result.rows[0];
};

const deleteIssueFromDB = async (issueId: number, role: string) => {
    const issueData = await pool.query(
        "SELECT * FROM issues WHERE id = $1",
        [issueId]
    );

    const issue = issueData.rows[0];

    if (!issue) {
        throw new Error("Issue not found");
    }

    if (role !== "maintainer") {
        throw new Error("Only maintainers can delete issues");
    }

    await pool.query("DELETE FROM issues WHERE id = $1", [issueId]);

    return null;
};

export const issueService = { createIssueIntoDB, getAllIssuesFromDB, getSingleIssueFromDB, updateIssueInDB, deleteIssueFromDB };