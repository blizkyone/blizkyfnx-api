import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const userLogin = asyncHandler(async (req, res) => {
   const { email, password } = req.body

   const user = await User.findOne({ email })

   if (user && (await user.matchPassword(password))) {
      const token = await user.generateAuthToken()
      res.json({
         _id: user._id,
         name: user.name,
         familyName: user.familyName,
         username: user.username,
         email: user.email,
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

// @desc    Check if username is available
// @route   GET /api/users/validateUsername?username=
// @access  Public
const validateUsername = asyncHandler(async (req, res) => {
   try {
      const usernameExists = await User.exists({
         username: req.query.username,
      })

      if (usernameExists) {
         res.send('Username already taken')
      } else {
         res.send('Valid username')
      }
   } catch (e) {
      console.log('Error validateUsername: ' + e)
      throw new Error('Error validating username')
   }
})

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
   console.log(req.body)
   const { name, username, email, password, familyName } = req.body

   const userExists = await User.findOne({ email })

   if (userExists) {
      res.status(400)
      throw new Error('User already exists')
   }

   // const customer = await stripe.customers.create({ name, email })

   const user = await User.create({
      name,
      familyName,
      username,
      email,
      password,
      // stripeId: customer.id,
   })

   if (user) {
      const token = await user.generateAuthToken()

      res.status(201).json({
         _id: user._id,
         name: user.name,
         familyName: user.familyName,
         email: user.email,
         username: user.username,
         // isAdmin: user.isAdmin,
         token,
         // token: generateToken(user._id),
      })
   } else {
      res.status(400)
      throw new Error('Invalid user data')
   }
})

export { userLogin, userLogout, validateUsername, registerUser }
