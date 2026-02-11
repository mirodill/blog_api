import multer from 'multer';

// 1. Rasmni diskka emas, RAM (xotira)ga vaqtincha yuklash tartibi
const storage = multer.memoryStorage();

// 2. Faqat rasm ekanligini tekshirish
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Faqat rasm fayllarini yuklash mumkin!'), false);
    }
};

// 3. Multer sozlamalari
const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // Base64 uchun 2MB limit tavsiya etiladi
});

export default upload;