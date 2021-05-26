import mongoose from 'mongoose'

const pointSchema = mongoose.Schema({
   type: {
      type: String,
      enum: ['Point'],
      required: true,
   },
   coordinates: {
      type: [Number],
      required: true,
   },
})

const addressSchema = mongoose.Schema({
   street_address: String,
   street_address_2: String,
   city: String,
   state: String,
   country: String,
})

const serviceSchema = mongoose.Schema(
   {
      owner: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
      },
      servicename: {
         type: String,
         unique: true,
         required: true,
      },
      name: {
         type: String,
         required: true,
      },
      categories: [String],
      description: {
         type: String,
      },
      phoneArray: [
         {
            phone: String,
            label: String,
         },
      ],
      address: addressSchema,
      lat: {
         type: String,
      },
      lng: {
         type: String,
      },
      location: {
         type: pointSchema,
      },
      recos: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
         },
      ],
      antirecos: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
         },
      ],
      team: [
         {
            user: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'User',
            },
            position: String,
         },
      ],
      webpage: {
         type: String,
      },
      instagram: {
         type: String,
      },
      photoGallery: [String],
   },
   {
      timestamps: true,
   }
)

const Service = mongoose.model('Service', serviceSchema)

export default Service
