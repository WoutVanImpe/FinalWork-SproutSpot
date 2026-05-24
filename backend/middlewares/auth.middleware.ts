import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export interface AuthenticatedRequest extends Request {
	user?: {
		id: number;
		email: string;
	};
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		res.status(401).json({
			error: "Unauthorized",
			message: "No valid authentication token provided",
		});
		return;
	}

	const token = authHeader.split(" ")[1];

	if (!token) {
		res.status(401).json({
			error: "Unauthorized",
			message: "No valid authentication token provided",
		});
		return;
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as unknown as { id: number; email: string };
		req.user = { id: decoded.id, email: decoded.email };
		next();
	} catch (error) {
		res.status(401).json({
			error: "Unauthorized",
			message: "Invalid or expired token",
		});
	}
};
