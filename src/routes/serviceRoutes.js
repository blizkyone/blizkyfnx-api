import express from 'express'
const router = express.Router()
import {
   getServices,
   getCategories,
   newCategory,
   createNewService,
   recommendService,
   getServiceProfile,
} from '../controllers/serviceController.js'
import { protect, admin, optional } from '../middleware/authMiddleware.js'

router.route('/').get(optional, getServices).post(protect, createNewService)
router
   .route('/categories')
   .get(protect, getCategories)
   .post(protect, newCategory)
router.route('/:id').get(optional, getServiceProfile)
router.route('/:id/recommend').get(protect, recommendService)

export default router
