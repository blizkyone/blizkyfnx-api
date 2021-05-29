import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const userSchema = mongoose.Schema(
   {
      name: {
         type: String,
         required: true,
      },
      familyName: {
         type: String,
         required: true,
      },
      username: {
         type: String,
         required: true,
         unique: true,
      },
      email: {
         type: String,
         unique: true,
         sparse: true,
      },
      phone: {
         type: String,
         unique: true,
         sparse: true,
      },
      countryCode: {
         type: String,
      },
      password: {
         type: String,
         required: true,
      },
      bio: String,
      friends: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
         },
      ],
      // followers: [
      //    {
      //       type: mongoose.Schema.Types.ObjectId,
      //       ref: 'User',
      //    },
      // ],
      requestFrom: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
         },
      ],
      requestTo: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
         },
      ],
      services: [
         {
            service: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'Service',
            },
            position: {
               type: String,
               required: true,
            },
         },
      ],
      teamRequest: [
         {
            sid: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'Service',
            },
            position: {
               type: String,
               required: true,
            },
         },
      ],
      recoServices: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
         },
      ],
      antirecoServices: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
         },
      ],
      facebookId: String,
      tokens: [
         {
            token: {
               type: String,
               required: true,
            },
         },
      ],
   },
   {
      timestamps: true,
   }
)

userSchema.methods.getServiceList = async function (services) {
   const user = this
   let serviceList = []

   services.forEach((service) => {
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
         description,
         webpage,
         instagram,
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
         description,
         phoneArray,
         webpage,
         instagram,
         _id,
      }

      ser.recommended = false
      // if(service.recos.includes(this.id)) { ser.recommended = true }
      service.recos.forEach((service) => {
         if (service._id == user.id) {
            ser.recommended = true
         }
      })

      ser.antirecommended = false
      // if(service.antirecos.includes(this.id)) { ser.antirecommended = true }
      service.antirecos.forEach((service) => {
         if (service._id == user.id) {
            ser.antirecommended = true
         }
      })

      const recosF = service.recos.filter(
         (x) => user.friends && user.friends.includes(x._id)
      )
      ser.recosFollowing = recosF

      const antirecosF = service.antirecos.filter(
         (x) => user.friends && user.friends.includes(x._id)
      )
      ser.antirecosFollowing = antirecosF

      const followings = service.team.filter(
         (x) => user.friends && user.friends.includes(x.user._id)
      )
      ser.teamFollowing = followings

      serviceList.push(ser)
   })

   return serviceList
}

userSchema.methods.matchPassword = async function (enteredPassword) {
   return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.generateAuthToken = async function () {
   const user = this
   const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
   user.tokens = user.tokens.concat({ token })
   try {
      await user.save()
      return token
   } catch (e) {
      console.log(e)
   }
}

userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) {
      next()
   }

   const salt = await bcrypt.genSalt(10)
   this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model('User', userSchema)

export default User
