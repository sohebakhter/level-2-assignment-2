import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { issueService } from "./issue.service";


const createIssue = async (req: Request, res: Response) => {
    try {
        const reporter_id = req.user?.id;

        if (!reporter_id) {
            return sendResponse(res, {
                statusCode: 401,
                success: false,
                message: "Unauthorized",
                error: "Missing reporter information",
            });
        }

        const result = await issueService.createIssueIntoDB(req.body, reporter_id);

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Issue created successfully",
            data: result,
        });
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Failed to create issue",
            error: error.message,
        });
    }
};

export const issueController = { createIssue };