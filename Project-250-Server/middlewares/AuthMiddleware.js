const jwt = require('jsonwebtoken');

const AuthMiddleware = async (req, res) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const payload = jwt.verify(token, process.env.JWT_KEY);
            const role = payload.role;

            const id = payload.id;
            req.user = {id,role};
        } catch (err) {
            res.status(400).json({ Message: "Invalid token" });
        }
    } else {
        res.status(400).json({ Message: "No token" });
    }
};


module.exports = AuthMiddleware;