import { Comment } from "../models/comment.js";
import { Order } from "../models/order.js";
import { User } from "../models/user.js";
import { asyncError } from "../middlewares/error.js";

// Get all comments
export const getAllComments = asyncError(async (req, res, next) => {
  try {
    const productId = req.params.productId; // Assuming product ID is passed as a parameter

    // Find all comments related to the specified product ID and populate the 'user' field with the 'name' of the user
    const comments = await Comment.find({ product: productId }).populate('user', 'name');

    res.json(comments);
  } catch (error) {
    console.error(error);
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

// Delete a comment
export const deleteComment = asyncError(async (req, res, next) => {
  try {
    const commentId = req.params.id; 
    const userId = req.user.id; 

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.user.toString() !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this comment" });
    }

    await comment.deleteOne();

    if (req.user.role !== 'admin') {
      const user = await User.findById(userId);
      if (user) {
        user.comments = user.comments.filter(comment => comment.toString() !== commentId);
        await user.save();
      }
    }

    res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


export const getProductRatings = asyncError(async (req, res, next) => {
  try {
    const productId = req.params.productId; 

    const comments = await Comment.find({ product: productId });

    if (comments.length === 0) {
      return res.status(404).json({ success: false, message: "No ratings found for this product" });
    }

    let totalRating = 0;
    comments.forEach(comment => {
      totalRating += comment.rating;
    });
    const averageRating = totalRating / comments.length;

    res.status(200).json({ success: true, averageRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});