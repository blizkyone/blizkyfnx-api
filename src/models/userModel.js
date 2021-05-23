import mongoose from 'mongoose'
import moment from 'moment'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const userSchema = mongoose.Schema(
   {
      name: {
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
         required: true,
         unique: true,
      },
      password: {
         type: String,
         required: true,
      },
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
