import jwt from 'jsonwebtoken';

/**
 * @desc    JWT tokenni tekshirish va foydalanuvchini autentifikatsiya qilish
 */
export const protect = (req, res, next) => {
    let token;

    // 1. Tokenni Authorization headeridan olish (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Ruxsat berilmadi, token topilmadi" 
        });
    }

    try {
        // 2. Tokenni tekshirish
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Foydalanuvchi ma'lumotlarini request obyektiga biriktirish
        // Endi istalgan controllerda req.user orqali foydalanuvchi id va rolyni olish mumkin
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
        };

        next(); // Keyingi bosqichga o'tish
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: "Token yaroqsiz yoki muddati o'tgan" 
        });
    }
};
export const updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    // req.user.id "protect" middleware-dan keladi
    const updatedUser = await User.update(req.user.id, { username, bio, avatar });
    
    res.status(200).json({ 
      success: true, 
      message: "Profil yangilandi", 
      data: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * @desc    Rollar bo'yicha ruxsatni cheklash (RBAC)
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Sizning rolingiz (${req.user.role}) ushbu amalni bajarishga ruxsat bermaydi` 
            });
        }
        next();
    };
};