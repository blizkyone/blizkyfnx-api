import asyncHandler from 'express-async-handler'
import axios from 'axios'

// @desc    autocomplete places
// @route   GET /api/places/autocomplete?input=${input}
// @access  Private
const placeAutocomplete = asyncHandler(async (req, res) => {
   let { input } = req.query

   let googleResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${input}&inputtype=textquery&fields=formatted_address,name,geometry&key=${process.env.GOOGLE_API_KEY}`
   )

   let places = googleResponse.data.candidates

   if (places) {
      res.json(places)
   } else {
      res.status(500)
      throw new Error('Something is wrong with the request to Goolge')
   }
})

// @desc    getDirectionsFromCoordinates
// @route   GET /api/places/getAddress?coordinates=${coordinates}
// @access  Private
const getAddress = asyncHandler(async (req, res) => {
   let googleResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${req.query.latlng}&result_type=street_address&key=${process.env.GOOGLE_API_KEY}`
   )

   // console.log(googleResponse.data.results)

   if (googleResponse) {
      res.json(googleResponse.data.results[0].formatted_address)
   } else {
      res.status(500)
      throw new Error('Something is wrong with the request to Goolge')
   }
})

export { placeAutocomplete, getAddress }
