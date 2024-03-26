import mongoose from "mongoose";

const schema = new mongoose.Schema({
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    recepientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    messageType: {
      type: String,
      enum: ["text", "image"],
    },
    message: String,
    imageUrl: {
      public_id: String,
      url: String,
    },
    timeStamp: {
      type: Date,
      default: Date.now,
    },
});
  
  
  export const Message = mongoose.model("Message", schema);