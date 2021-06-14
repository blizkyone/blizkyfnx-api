import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import Service from '../models/serviceModel.js'
import mongoose from 'mongoose'

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
   // console.log(req.body)
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

// @desc    Get user profile info
// @route   GET /api/users/:id
// @access  Optional
const getUserProfile = asyncHandler(async (req, res) => {
   const id = mongoose.Types.ObjectId(req.params.id)
   let recoCategories = []
   let antirecoCategories = []

   let profile = await User.findById(id)
      .populate({
         path: 'services',
         populate: { path: 'service', model: 'Service' },
      })
      .populate('recoServices')
      .populate({
         path: 'recoServices',
         populate: {
            path: 'team',
            populate: {
               path: 'user',
               model: 'User',
               select: 'name familyName',
            },
         },
      })
      .populate('friends')
      .lean()

   if (profile.recoServices.length > 0) {
      let tempArray = []
      // console.log(profile.recoServices)
      profile.recoServices.forEach((service) => {
         service.categories.forEach((category) => tempArray.push(category))
      })
      recoCategories = [...new Set(tempArray)]
   }

   if (req.user) {
      profile = await req.user.getUserProfile(profile)
   }

   // if (profile.antirecoServices.length > 0) {
   //    let tempArray = []
   //    profile.antirecoServices.forEach((service) => {
   //       service.categories.forEach((category) => tempArray.push(category))
   //    })
   //    antirecoCategories = [...new Set(tempArray)]
   // }
   // console.log(profile.services)

   res.send({ profile, recoCategories })
})

// @desc    Get my profile
// @route   GET /api/users
// @access  Private
const getMyProfile = asyncHandler(async (req, res) => {
   let recoCategories = []
   let antirecoCategories = []

   let profile = await User.findById(req.user._id)
      .populate({
         path: 'services',
         populate: { path: 'service', model: 'Service' },
      })
      // .populate({
      //    path: 'services',
      //    populate: {
      //       path: 'service',
      //       populate: {
      //          path: 'team',
      //          populate: {
      //             path: 'user',
      //             model: 'User',
      //             select: 'name familyName',
      //          },
      //       },
      //    },
      // })
      .populate('recoServices')
      .populate({
         path: 'recoServices',
         populate: {
            path: 'team',
            populate: {
               path: 'user',
               model: 'User',
               select: 'name familyName',
            },
         },
      })
      .populate({
         path: 'teamRequest',
         populate: {
            path: 'service',
            model: 'Service',
            select: 'name',
         },
      })
      // .populate('antirecoServices')
      // .populate({
      //    path: 'antirecoServices',
      //    populate: {
      //       path: 'team',
      //       populate: {
      //          path: 'user',
      //          model: 'User',
      //          select: 'name familyName',
      //       },
      //    },
      // })
      .populate('friends')

   if (profile.recoServices.length > 0) {
      let tempArray = []
      // console.log(profile.recoServices)
      profile.recoServices.forEach((service) => {
         service.categories.forEach((category) => tempArray.push(category))
      })
      recoCategories = [...new Set(tempArray)]
   }

   // if (profile.antirecoServices.length > 0) {
   //    let tempArray = []
   //    profile.antirecoServices.forEach((service) => {
   //       service.categories.forEach((category) => tempArray.push(category))
   //    })
   //    antirecoCategories = [...new Set(tempArray)]
   // }
   // console.log(profile.services)

   res.send({ profile, recoCategories })
})

// @desc    Solicitar o aceptar conexión con un usuario
// @route   GET /api/users/:id/connect
// @access  Private
const connectToUser = asyncHandler(async (req, res) => {
   const id = mongoose.Types.ObjectId(req.params.id)

   if (req.body.reject) {
      // console.log('rejected a request')
      const me = await req.user.updateOne({
         $pull: { requestFrom: id },
      })
      const user = await User.findByIdAndUpdate(id, {
         $pull: { requestTo: req.user._id },
      })
      res.send(me)
      return
   }

   const isRequested = req.user.requestTo.indexOf(id)
   const receivedRequest = req.user.requestFrom.indexOf(id)
   const isFriend = req.user.friends.indexOf(id)

   if (isFriend !== -1) {
      // console.log('un friended')
      const me = await req.user.updateOne({
         $pull: { friends: id },
      })
      const user = await User.findByIdAndUpdate(id, {
         $pull: { friends: req.user._id },
      })
      res.send(me)
   } else if (isRequested !== -1) {
      // console.log('canceled a request')
      const me = await req.user.updateOne({
         $pull: { requestTo: id },
      })
      const user = await User.findByIdAndUpdate(id, {
         $pull: { requestFrom: req.user._id },
      })
      res.send(me)
   } else if (receivedRequest !== -1) {
      // console.log('handled a request')
      const me = await req.user.updateOne({
         $pull: { requestFrom: id },
         $addToSet: { friends: id },
      })

      const user = await User.findByIdAndUpdate(id, {
         $pull: { requestTo: req.user._id },
         $addToSet: { friends: req.user._id },
      })
      await user.notify({
         type: 'new-friend',
         message: 'Es tu amigo en Blizky',
         about_user: req.user._id,
      })

      res.send(me)
   } else {
      // console.log('sent a request')
      const me = await req.user.updateOne({
         $addToSet: { requestTo: id },
      })
      const user = await User.findByIdAndUpdate(id, {
         $addToSet: { requestFrom: req.user._id },
      })
      await user.notify({
         type: 'friend-request',
         message: 'Ha solicitado tu amistad',
         about_user: req.user._id,
      })
      res.send(me)
   }
})

// @desc    Editar mi perfil de usuario
// @route   PUT /api/users/
// @access  Private
const editProfile = asyncHandler(async (req, res) => {
   // const { name, familyName, bio, username } = req.body
   const updates = Object.keys(req.body)

   const usernameExists = await User.exists({ username: req.body.username })
   if (usernameExists && req.user.username !== req.body.username) {
      throw new Error('El nombre de usuario ya está ocupado')
   }

   // const newUser = await req.user.update({ name, familyName, bio, username })
   updates.forEach((update) => (req.user[update] = req.body[update]))
   let newUser = await req.user.save()
   res.send(newUser)
})

// @desc    Invitar usuario a un equipo
// @route   POST /api/users/:username/invite-to-team
// @access  Private
const inviteToTeam = asyncHandler(async (req, res) => {
   const { username } = req.params
   const { service, position } = req.body
   // console.log(req.params)

   const user = await User.findOneAndUpdate(
      { username },
      {
         $addToSet: {
            teamRequest: {
               service: mongoose.Types.ObjectId(service),
               position,
            },
         },
      }
   )

   if (!user) {
      throw new Error(`No se encontró al usuario: ${username}`)
   }

   res.send(true)
})

// @desc    Aceptar o rechazar invitación a un equipo
// @route   POST /api/users/:service/handle-invite-to-team
// @access  Private
const handleInviteToTeam = asyncHandler(async (req, res) => {
   const { service } = req.params
   const { accept, position } = req.body
   // console.log(req.params)

   if (accept) {
      await req.user.update({
         $pull: {
            teamRequest: {
               service: mongoose.Types.ObjectId(service),
               position,
            },
         },
         $addToSet: {
            services: { service: mongoose.Types.ObjectId(service), position },
         },
      })
      await Service.findByIdAndUpdate(service, {
         $addToSet: { team: { user: req.user._id, position } },
      })
   } else {
      await req.user.update({
         $pull: {
            teamRequest: {
               service: mongoose.Types.ObjectId(service),
               position,
            },
         },
      })
   }

   res.send(true)
})

export {
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
}
