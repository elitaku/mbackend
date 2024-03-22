import { Comment } from "../models/comment.js";
import { Order } from "../models/order.js";
import { User } from "../models/user.js";
import { asyncError } from "../middlewares/error.js";

// Get all comments
export const getAllComments = asyncError(async (req, res, next) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a new comment
export const addComment = asyncError(async (req, res, next) => {
  // const order = await Order.findById(req.params.id);
  // if (!order) return next(new ErrorHandler("Order Not Found", 404));

  // if (order.orderStatus === "Preparing") {
  //   order.orderStatus = "Shipped";

  try {
    const { text, productId, userId, rating } = req.body;

    // Chec if the user has ordered and is delivered
    const userOrder = await Order.findOne({
      "orderItems.product": productId,
      user: userId,
      "orderStatus": "Delivered",
    });

    if (!userOrder) {
      return res.status(400).json({
        success: false,
        message: "You can only comment on delivered products",
      });
    }

    //Find user
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    //Ensure the user's comment list is setup
    if (!user.comments) {
      user.comments = [];
    }

    //Check is the user has already commented
    const existingComment = await Comment.findOne({
      user: userId,
      product: productId,
    });

    if (existingComment) {
      //If the user has already commented update the existing comment
      existingComment.text = text;
      existingComment.rating = rating;

      await existingComment.save();

      return res.status(200).json({
        success: true,
        message: "Comment Updated Successfully",
      });
    }

    // Create a new comment
    const newComment = await Comment.create({
      text,
      product: productId,
      user: userId,
      rating,
    });

    await newComment.save();

    user.comments.push(newComment);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Commented Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }

  // }
});
