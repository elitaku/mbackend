import { User } from "../models/user.js";
import { Message } from "../models/message.js"
import ErrorHandler from "../utils/error.js";
import { asyncError } from "../middlewares/error.js";
import { cookieOptions, getDataUri, sendEmail, sendToken } from "../utils/features.js";
import { passwordResetEmailTemplate } from "../utils/emailHTMLTemplate.js";
import cloudinary from "cloudinary";

// New controller created

export const getAllUsers = asyncError(async (req, res) => {
  const loggedInUserId = req.user._id;

  try {
    const users = await User.find({ _id: { $ne: loggedInUserId } })
    res.status(200).json({
      success: true,
      users
    });

  } catch (err) {
    console.log("Error retrieving users", err);

    res.status(500).json({ message: "Error retrieving users" });
  }

});

export const sendContactRequest = asyncError(async (req, res) => {

  const { currentUserId, selectedUserId } = req.body;
  try {

    await User.findByIdAndUpdate(selectedUserId, {
      $push: { contactRequest: currentUserId },
    });
    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentContactRequest: selectedUserId },
    });

    res.sendStatus(200);

  } catch (error) {
    console.log(error)
    res.sendStatus(500);
  }
})

export const getContactRequest = asyncError(async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate("contactRequest", "name email avatar")
      .lean();

    const contactRequest = user.contactRequest;

    res.json(contactRequest);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const acceptContactRequest = asyncError(async (req, res) => {
  try {
    const currentUserId = req.body.currentUserId;
    const selectedUserId = req.body.selectedUserId;


    const sender = await User.findById(currentUserId);
    const recepient = await User.findById(selectedUserId);

    const sentIndexSender = sender.sentContactRequest.indexOf(selectedUserId);
    if (sentIndexSender !== -1) {
      sender.sentContactRequest.splice(sentIndexSender, 1);
    }
    const receivedIndexSender = sender.contactRequest.indexOf(selectedUserId);
    if (receivedIndexSender !== -1) {
      sender.contactRequest.splice(receivedIndexSender, 1);
    }

    const receivedIndexRecepient = recepient.contactRequest.indexOf(currentUserId);
    if (receivedIndexRecepient !== -1) {
      recepient.contactRequest.splice(receivedIndexRecepient, 1);
    }
    const sentIndexRecepient = recepient.sentContactRequest.indexOf(currentUserId);
    if (sentIndexRecepient !== -1) {
      recepient.sentContactRequest.splice(sentIndexRecepient, 1);
    }


    sender.contacts.push(selectedUserId);
    recepient.contacts.push(currentUserId);

    await sender.save();
    await recepient.save();

    res.status(200).json({ message: "Contact Request accepted successfully" });

  } catch (error) {
    console.log('acceptContactRequest controller error: ', error);

    res.status(500).json({ message: "Internal Server Error" });
  }
})

export const getAllContacts = asyncError(async (req, res) => {
  // try {
  //   const userId = req.user._id;

  //   const user = await User.findById(userId).populate(
  //     "contacts",
  //     "name email avatar"
  //   );
  //   const acceptedContacts = user.contacts;

  //   res.status(200).json({
  //     success: true,
  //     acceptedContacts
  //   });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ error: "Internal Server Error" });
  // }
  try {
    const userId = req.user._id;
  
    let user = await User.findById(userId).populate(
      "contacts",
      "name email avatar"
    );
  
    // Fetch the latest message for each contact
    const contactsWithLatestMessage = await Promise.all(user.contacts.map(async (contact) => {
      const latestMessage = await Message.findOne({
        $or: [
          { senderId: contact._id, recepientId: userId },
          { senderId: userId, recepientId: contact._id }
        ]
      }).sort('-timeStamp');
  
      return {
        ...contact._doc,
        latestMessage
      };
    }));
  
    // Sort the contacts based on the timestamp of the latest message
    const sortedContacts = contactsWithLatestMessage.sort((a, b) => {
      if (a.latestMessage && b.latestMessage) {
        return b.latestMessage.timeStamp - a.latestMessage.timeStamp;
      } else if (a.latestMessage) {
        return -1;
      } else if (b.latestMessage) {
        return 1;
      } else {
        return 0;
      }
    });
  
    res.status(200).json({
      success: true,
      acceptedContacts: sortedContacts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

export const sendMessage = asyncError(async (req, res) => {
  try {
    const { userId, recepientId, messageType, message } = req.body;

    const newMessage = new Message({
      senderId: userId,
      recepientId,
      messageType,
      message: message,
      timestamp: new Date(),
      imageUrl: messageType === "image" ? req.file.path : null,
    });

    await newMessage.save();
    res.status(200).json({ message: "Message sent Successfully" });

  } catch (error) {
    console.log('sendMessage error: ', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export const getUserDetails = asyncError(async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user data from the user ID
    const recepientId = await User.findById(userId);

    res.status(200).json({
      success: true,
      recepientId
    });
  } catch (error) {
    console.log('getUserDetails error: ', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export const getChatRoomDetails = asyncError(async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;

    console.log('senderId: ', senderId)
    console.log('recepientId: ', recepientId)


    const messages = await Message.find({
      $or: [
        { senderId: senderId, recepientId: recepientId },
        { senderId: recepientId, recepientId: senderId },
      ],
    }).populate("senderId", "_id name");

    console.log('getChatRoomDetails: ', messages)

    res.status(200).json({
      success: true,
      messages
    });

  } catch (error) {
    console.log('getChatRoomDetails error: ', error);
    res.status(500).json({ error: error});
  }
});

export const getAllMessages = asyncError(async (req, res) => {
  try{
    const {userId} = req.params;
    const messages = await Message.find({ $or: [
      { senderId: userId},
      {recepientId: userId },
    ],}).populate("senderId", "_id name");
    
    res.status(200).json({
      success: true,
      messages
    });
  }catch(error){
    console.log('getAllMessages error: ', error);
    res.status(500).json({ error: error});
  }
  

})