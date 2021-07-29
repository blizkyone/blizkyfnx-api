import express from 'express'
import passport from 'passport'
const router = express.Router()
import {
   userLogin,
   userLogout,
   facebookAuthCallback,
   googleAuthCallback,
} from '../controllers/authControllers.js'
import { protect } from '../middleware/authMiddleware.js'

router.route('/login').post(userLogin)
router.route('/logout').get(protect, userLogout)
router.route('/facebook').get(
   passport.authenticate('facebook', {
      scope: [
         'user_friends',
         'public_profile',
         'user_age_range',
         'user_birthday',
         'user_gender',
      ],
   })
)
router.route('/facebook/callback').get(
   passport.authenticate('facebook', {
      failureRedirect: '/login',
   }),
   facebookAuthCallback
)
router.route('/google/').get(
   passport.authenticate('google', {
      scope: ['profile', 'https://www.googleapis.com/auth/userinfo.email'],
   })
)
router.route('/google/callback').get(
   passport.authenticate('google', {
      failureRedirect: '/login',
   }),
   googleAuthCallback
)

export default router
