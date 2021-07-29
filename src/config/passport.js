import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import passport from 'passport'
import User from '../models/userModel.js'

const passportConfig = async () => {
   passport.use(
      new FacebookStrategy(
         {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: '/api/auth/facebook/callback',
            // passReqToCallback: true,
         },
         function (accessToken, refreshToken, profile, done) {
            console.log(`accessToken: ${accessToken}`)
            console.log(`refreshToken: ${refreshToken}`)
            console.log(profile)
            // let newUser = {
            //    googleId: profile.id,
            //    name: profile.name.givenName,
            //    familyName: profile.name.familyName,
            //    email: profile.emails[0].value,
            // }
            done(null, profile)
         }
      )
   )

   passport.use(
      new GoogleStrategy(
         {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
            // passReqToCallback: true,
         },
         async (accessToken, refreshToken, profile, done) => {
            console.log(`accessToken: ${accessToken}`)
            console.log(`refreshToken: ${refreshToken}`)
            console.log(profile._json)
            let newUser = {
               googleId: profile.id,
               name: profile.name.givenName,
               familyName: profile.name.familyName,
               email: profile.emails[0].value,
            }
            // console.log(newUser)
            // let user = await User.findOne({ googleId: profile.id })
            // if (user) {
            //    console.log('we have user')
            // } else {
            //    console.log('we do not have user')
            // }
            done(null, profile)
         }
      )
   )

   passport.serializeUser((user, done) => {
      console.log(user.id)
      done(null, user.id)
   })

   passport.deserializeUser((id, done) => {
      console.log(`deserialize user id: ${id}`)
      User.findById(id, (err, user) => done(err, user))
   })
}

export default passportConfig
