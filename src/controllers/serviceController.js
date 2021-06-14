import asyncHandler from 'express-async-handler'
import Service from '../models/serviceModel.js'
import Category from '../models/categoryModel.js'
import User from '../models/userModel.js'
import mongoose from 'mongoose'
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

// @desc    Get Service Profile
// @route   GET /api/services/:id
// @access  Optional
const getServiceProfile = asyncHandler(async (req, res) => {
   const id = mongoose.Types.ObjectId(req.params.id)

   let service = await Service.findById(id)
      .populate({
         path: 'team',
         populate: {
            path: 'user',
            model: 'User',
            select: 'name familyName',
         },
      })
      .lean()

   if (req.user) {
      service = await req.user.getService(service)
   }

   res.send(service)
})

// @desc    Create new Service
// @route   POST /api/services/
// @access  Private
const createNewService = asyncHandler(async (req, res) => {
   const {
      name,
      description,
      phoneArray,
      webpage,
      instagram,
      lat,
      lng,
      address,
      categories,
   } = req.body

   const location = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)],
   }

   const team = [
      {
         user: req.user._id,
         position: 'owner',
      },
   ]

   const service = await Service.create({
      owner: req.user._id,
      name,
      description,
      phoneArray,
      webpage,
      instagram,
      team,
      lat,
      lng,
      address,
      categories,
      location,
   })

   if (service) {
      await User.findByIdAndUpdate(req.user.id, {
         $addToSet: { services: { service: service._id, position: 'owner' } },
      })
   } else {
      throw new Error('Unable to create service')
   }

   res.send(service)
})

// @desc    Get categories for a given language
// @route   GET /api/services/categories?language=${language}
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
   const { language } = req.query
   // console.log(req.query)
   const categories = await Category.find({ language }).sort('name')

   res.send(categories)
})

// @desc    Create new category for given language
// @route   GET /api/services/categories
// @access  Private
const newCategory = asyncHandler(async (req, res) => {
   const { language, new_category } = req.body
   const exists = await Category.findOne({
      language,
      name: new_category,
   })
   if (exists) {
      throw new Error('Esa categoria ya existe')
   }
   const newCategory = await Category.create({ language, name: new_category })
   res.send(newCategory)
})

// @desc    Recommend a service
// @route   GET /api/services/:id/recommend
// @access  Private
const recommendService = asyncHandler(async (req, res) => {
   const id = mongoose.Types.ObjectId(req.params.id)

   const isRecommended = req.user.recoServices.indexOf(id)

   if (isRecommended !== -1) {
      const service = await Service.findByIdAndUpdate(
         id,
         {
            $pull: { recos: req.user._id },
         },
         { new: true }
      )
      const user = await req.user.updateOne({
         $pull: { recoServices: id },
      })
      res.send(service)
   } else {
      const service = await Service.findByIdAndUpdate(
         id,
         {
            $addToSet: { recos: req.user._id },
         },
         { new: true }
      )
      const user = await req.user.updateOne({
         $addToSet: { recoServices: id },
      })
      res.send(service)
   }
})

// @desc    Editar mi servicio
// @route   PUT /api/service/
// @access  Private
const editServiceProfile = asyncHandler(async (req, res) => {
   // const { name, familyName, bio, username } = req.body
   const service = await Service.findById(req.params.id)
   if (!req.user._id.equals(service.owner)) {
      throw new Error('Solo el dueño del servicio puede editar la información')
   }

   const updates = Object.keys(req.body)

   // const newUser = await req.user.update({ name, familyName, bio, username })
   updates.forEach((update) => (service[update] = req.body[update]))
   let newService = await service.save()
   res.send(newService)
})

export {
   getServices,
   getCategories,
   newCategory,
   createNewService,
   recommendService,
   getServiceProfile,
   editServiceProfile,
}
