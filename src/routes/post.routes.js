// ... boshqa importlar
import { 
  createPost, 
  getPosts, 
  getPostById, 
  getPostBySlug, // <-- YANGI FUNKSIYANI IMPORT QILING
  updatePost, 
  deletePost 
} from '../controllers/post.controller.js';

const router = express.Router();

// Slug orqali olish (/:id bilan adashtirib yubormaslik uchun /get/slug/ ko'rinishi xavfsiz)
router.get('/slug/:slug', getPostBySlug); 

router.route('/')
  .get(getPosts)
  .post(protect, upload.single('cover_image'), createPost);

router.route('/:id')
  .get(getPostById)
  .put(protect, upload.single('cover_image'), updatePost)
  .delete(protect, deletePost);

export default router;