import asyncHandler from 'express-async-handler'
import Service from '../models/serviceModel.js'
import User from '../models/userModel.js'

// @desc    Get list of nearby services and their categories
// @route   GET /api/services/
// @access  Public
const getServices = asyncHandler(async (req, res) => {
   const { city, state, country } = req.query
   let services = await Service.find({
      $and: [
         { 'address.city': city },
         { 'address.state': state },
         { 'address.country': country },
      ],
   })
      .populate({
         path: 'team',
         populate: { path: 'user', model: 'User', select: 'name familyName' },
      })
      .populate('recos', 'name familyName username')
      .populate('antirecos', 'name familyName username')

   if (req.user) {
      services = services.map((service) => {
         let ser = new Object()

         const {
            servicename,
            name,
            categories,
            lat,
            lng,
            recos,
            antirecos,
            team,
            phoneArray,
            _id,
         } = service
         ser = {
            servicename,
            name,
            categories,
            lat,
            lng,
            recos,
            antirecos,
            team,
            phoneArray,
            _id,
         }

         ser.recommended = false
         // if(service.recos.includes(this.id)) { ser.recommended = true }
         service.recos.forEach((service) => {
            if (service._id === req.user._id) {
               ser.recommended = true
            }
         })

         ser.antirecommended = false
         // if(service.antirecos.includes(this.id)) { ser.antirecommended = true }
         service.antirecos.forEach((service) => {
            if (service._id === req.user._id) {
               ser.antirecommended = true
            }
         })

         const recosF = service.recos.filter(
            (x) => req.user.following && req.user.following.includes(x._id)
         )
         ser.recosFollowing = recosF
         const antirecosF = service.antirecos.filter(
            (x) => req.user.following && req.user.following.includes(x._id)
         )
         ser.antirecosFollowing = antirecosF
         const followings = service.team.filter(
            (x) => req.user.following && req.user.following.includes(x.user._id)
         )
         ser.teamFollowing = followings

         return ser
      })
   }

   const categories = await Service.find({
      $and: [
         { 'address.city': city },
         { 'address.state': state },
         { 'address.country': country },
      ],
   }).distinct('categories')

   // console.log(services)
   res.json({ services, categories })
})

export { getServices }
