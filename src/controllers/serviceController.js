import asyncHandler from 'express-async-handler'
import Service from '../models/serviceModel.js'
import User from '../models/userModel.js'

// @desc    Get list of nearby services and their categories
// @route   GET /api/services/
// @access  Public
const getServices = asyncHandler(async (req, res) => {
   const { city, state, country } = req.query
   const services = await Service.find({
      $and: [
         { 'address.city': city },
         { 'address.state': state },
         { 'address.country': country },
      ],
   })

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
