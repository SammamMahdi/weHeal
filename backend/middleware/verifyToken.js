import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
	// console.log('Verifying token...');
	// console.log('Cookies:', req.cookies);
	// console.log('Authorization header:', req.headers.authorization);

	// Check for token in cookies or Authorization header
	let token = req.cookies.token;
	
	// If no token in cookies, check Authorization header
	if (!token && req.headers.authorization) {
		const authHeader = req.headers.authorization;
		if (authHeader.startsWith('Bearer ')) {
			token = authHeader.split(' ')[1];
		}
	}

	if (!token) {
		console.log('No token found in cookies or Authorization header');
		return res.status(401).json({ 
			success: false, 
			message: "Unauthorized - no token provided" 
		});
	}

	try {
		// console.log('JWT Secret exists:', !!process.env.JWT_SECRET);
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		// console.log('Token decoded successfully:', decoded);

		req.userId = decoded.userId;
		next();
	} catch (error) {
		console.error('Token verification failed:', error);
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({ 
				success: false, 
				message: "Token has expired" 
			});
		}
		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({ 
				success: false, 
				message: "Invalid token" 
			});
		}
		return res.status(401).json({ 
			success: false, 
			message: "Token verification failed" 
		});
	}
};