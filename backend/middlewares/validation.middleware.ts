import { Request, Response, NextFunction } from "express";

export const validateBody = (requiredFields: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const missing = requiredFields.filter((field) => !(field in req.body));

		if (missing.length > 0) {
			res.status(400).json({
				error: "Validation Error",
				message: `Missing required fields: ${missing.join(", ")}`,
			});
			return;
		}

		next();
	};
};

export const validateParams = (requiredParams: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const missing = requiredParams.filter((param) => !req.params[param]);

		if (missing.length > 0) {
			res.status(400).json({
				error: "Validation Error",
				message: `Missing URL parameters: ${missing.join(", ")}`,
			});
			return;
		}

		next();
	};
};

export const validateQuery = (requiredQuery: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const missing = requiredQuery.filter((query) => !req.query[query]);

		if (missing.length > 0) {
			res.status(400).json({
				error: "Validation Error",
				message: `Missing query parameters: ${missing.join(", ")}`,
			});
			return;
		}

		next();
	};
};
