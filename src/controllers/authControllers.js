import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'

// @desc    Callback auth user with FacebookStrategy
// @route   GET /api/auth/facebook/callback
// @access  Public
const facebookAuthCallback = (req, res) => {
   res.redirect('https://localhost:3000')
   // console.log(req.user)
}

// @desc    Callback auth user with GoogleStrategy
// @route   GET /api/auth/google/callback
// @access  Public
const googleAuthCallback = (req, res) => {
   // console.log(req.profile)
   res.redirect('https://localhost:3000')
}

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const userLogin = asyncHandler(async (req, res) => {
   const { email, password } = req.body

   const user = await User.findOne({ email }).populate({
      path: 'services',
      populate: { path: 'service', model: 'Service' },
   })

   if (user && (await user.matchPassword(password))) {
      const token = await user.generateAuthToken()
      res.json({
         _id: user._id,
         name: user.name,
         familyName: user.familyName,
         username: user.username,
         email: user.email,
         services: user.services,
         // stripeId: user.stripeId,
         // paymentMethod: user.paymentMethod,
         // isAdmin: user.isAdmin,
         token,
      })
      // res.json(user)
   } else {
      res.status(401)
      throw new Error('Invalid email or password')
   }
})

// @desc    User logout
// @route   GET /api/users/logout
// @access  Private
const userLogout = asyncHandler(async (req, res) => {
   req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
   })
   // req.user.tokens = []
   await req.user.save()

   res.send(`User ${req.user.username} logged out`)
})

export { userLogin, userLogout, facebookAuthCallback, googleAuthCallback }
