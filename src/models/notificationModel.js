import mongoose from 'mongoose'

const notificationSchema = mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
      },
      type: {
         type: String,
         required: true,
         enum: [
            'new-friend',
            'friend-request',
            'team-request',
            'new-user',
            'new-service',
            'user-info',
            'service-info',
            'account-info',
         ],
         default: 'account-info',
      },
      message: String,
      about_user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
      },
      about_service: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Service',
      },
      seen: {
         type: Boolean,
         required: true,
         default: false,
      },
   },
   {
      timestamps: true,
   }
)

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification
