import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
   const { email, password } = req.body

   const user = await User.findOne({ email })

   if (user && (await user.matchPassword(password))) {
      const token = await user.generateAuthToken()
      res.json({
         _id: user._id,
         name: user.name,
         email: user.email,
         stripeId: user.stripeId,
         paymentMethod: user.paymentMethod,
         isAdmin: user.isAdmin,
         token,
      })
      // res.json(user)
   } else {
      res.status(401)
      throw new Error('Invalid email or password')
   }
})

export { authUser }
