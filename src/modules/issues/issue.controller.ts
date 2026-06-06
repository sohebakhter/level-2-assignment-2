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

const getAllIssues = async (req: Request, res: Response) => {
    try {

        //query parameters coming from url
        const sort = req.query.sort as string;
        const type = req.query.type as string;
        const status = req.query.status as string;

        const result = await issueService.getAllIssuesFromDB({
            sort,
            type,
            status,
        });

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issues retrieved successfully",
            data: result,
        });
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Failed to fetch issues",
            error: error.message,
        });
    }
};

const getSingleIssue = async (req: Request, res: Response) => {

    try {

        const id = Number(req.params.id);

        const result = await issueService.getSingleIssueFromDB(id);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue retrieved successfully",
            data: result,
        });
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Failed to fetch issue",
            error: error.message,
        });
    }
};

const updateIssue = async (req: Request, res: Response) => {
    try {

        const result = await issueService.updateIssueInDB(
            Number(req.params.id),
            req.user?.id as number,
            req.user?.role as string,
            req.body
        );

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue updated successfully",
            data: result,
        });
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Failed to update issue",
            error: error.message,
        });
    }
};

const deleteIssue = async (req: Request, res: Response) => {

    try {

        const issueId = Number(req.params.id);

        const role = req.user?.role as string;

        const result = await issueService.deleteIssueFromDB(issueId, role);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue deleted successfully",

        });


    } catch (error: any) {

        sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Failed to delete issue",
            error: error.message,
        });

    }
}

export const issueController = { createIssue, getAllIssues, getSingleIssue, updateIssue, deleteIssue };