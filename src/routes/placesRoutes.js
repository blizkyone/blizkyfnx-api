import express from 'express'
const router = express.Router()
import {
   placeAutocomplete,
   getAddress,
} from '../controllers/placesControllers.js'
import { protect } from '../middleware/authMiddleware.js'

router.route('/autocomplete').get(protect, placeAutocomplete)
router.route('/getAddress').get(protect, getAddress)

export default router
