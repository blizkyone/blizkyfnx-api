import express from 'express'
const router = express.Router()
import {
   userLogin,
   userLogout,
   validateUsername,
   registerUser,
   getMyProfile,
   connectToUser,
   getUserProfile,
} from '../controllers/userController.js'
import { protect, optional } from '../middleware/authMiddleware.js'

router.route('/').post(registerUser).get(protect, getMyProfile)
router.route('/login').post(userLogin)
router.route('/logout').get(protect, userLogout)
router.route('/validateUsername').get(validateUsername)
router.route('/:id/connect').post(protect, connectToUser)
router.route('/:id').get(optional, getUserProfile)

export default router
