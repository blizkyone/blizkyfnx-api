import express from 'express'
const router = express.Router()
import { getServices } from '../controllers/serviceController.js'
import { protect, admin, optional } from '../middleware/authMiddleware.js'

router.route('/').get(optional, getServices)

export default router
