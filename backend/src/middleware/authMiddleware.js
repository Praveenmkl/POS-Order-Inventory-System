const jwt = require("jsonwebtoken");

const protect = (req,res,next) =>{
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader){
            return res.status(401).json({
                message: "No token provided",
            });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;
        next();

    }
    catch(error){
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};

const authorizeRoles = (...roles) => {
    const uppercaseRoles = roles.map((r) => String(r).toUpperCase());
    return (req, res, next) => {
        const userRoleUpper = req.user?.role ? String(req.user.role).toUpperCase() : "";
        if (!req.user || !uppercaseRoles.includes(userRoleUpper)) {
            return res.status(403).json({
                message: `User role '${req.user?.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };