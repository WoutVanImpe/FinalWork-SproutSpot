import { Request, Response, NextFunction } from "express";

interface ErrorResponse {
	error: string;
	message: string;
}

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.error(`[Error] ${err.message}`);
	console.error(err.stack);

	const statusCode = (err as any).statusCode || 500;
	const response: ErrorResponse = {
		error: statusCode === 500 ? "Internal Server Error" : "Bad Request",
		message: err.message,
	};

	res.status(statusCode).json(response);
};
