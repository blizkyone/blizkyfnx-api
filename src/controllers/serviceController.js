import asyncHandler from 'express-async-handler'
import Service from '../models/serviceModel.js'
// import User from '../models/userModel.js'

// @desc    Get list of nearby services and their categories
// @route   GET /api/services/
// @access  Public
const getServices = asyncHandler(async (req, res) => {
   // const user = req.user
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
      services = await req.user.getServiceList(services)
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
