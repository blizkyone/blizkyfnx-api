import express from 'express'
const router = express.Router()
import {
   userLogin,
   userLogout,
   validateUsername,
   registerUser,
} from '../controllers/userController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/').post(registerUser)
router.route('/login').post(userLogin)
router.route('/logout').get(userLogout)
router.route('/validateUsername').get(validateUsername)

export default router
