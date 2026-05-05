import { Request, Response, NextFunction } from "express";

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

	/* TODO: Implement JWT verification once jsonwebtoken is installed
	 * For now, this is a placeholder that passes through for development
	 */
	try {
		req.user = {
			id: 1,
			email: "dev@sproutspot.local",
		};
		next();
	} catch (error) {
		res.status(401).json({
			error: "Unauthorized",
			message: "Invalid or expired token",
		});
	}
};
