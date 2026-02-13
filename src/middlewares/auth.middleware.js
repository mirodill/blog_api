import jwt from 'jsonwebtoken';

// 1. Logindan o'tganlikni tekshirish (protect)
export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({ message: "Ruxsat berilmagan, token topilmadi" });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded; // Token ichidagi user ma'lumotlarini req.user ga yuklaymiz
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token yaroqsiz yoki muddati o'tgan" });
    }
};

// 2. Rollarni tekshirish (authorize)
// Bu funksiya "admin", "author" kabi rollarni qabul qiladi
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Sizning rolingiz (${req.user?.role || 'user'}) ushbu amalni bajarishga ruxsat bermaydi` 
            });
        }
        next();
    };
};
// auth.middleware.js
export const adminMiddleware = (req, res, next) => {
    // req.user verifyToken middleware-dan kelgan bo'lishi kerak
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Sizda adminlik huquqi yo'q!" });
    }
};