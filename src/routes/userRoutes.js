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
   editProfile,
   inviteToTeam,
   handleInviteToTeam,
} from '../controllers/userController.js'
import { protect, optional } from '../middleware/authMiddleware.js'

router.route('/').post(registerUser).get(protect, getMyProfile)
router.route('/profile').put(protect, editProfile)
router.route('/login').post(userLogin)
router.route('/logout').get(protect, userLogout)
router.route('/validateUsername').get(validateUsername)
router.route('/:id/connect').post(protect, connectToUser)
router.route('/:username/invite-to-team').post(protect, inviteToTeam)
router
   .route('/:service/handle-invite-to-team')
   .post(protect, handleInviteToTeam)
router.route('/:id').get(optional, getUserProfile)

export default router
