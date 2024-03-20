import { asyncError } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { stripe } from "../server.js";
import ErrorHandler from "../utils/error.js";
import { preparingTemplate, shippedTemplate, deliveredTemplate } from "../utils/emailHTMLTemplate.js";
import { sendEmail } from "../utils/features.js";
export const processPayment = asyncError(async (req, res, next) => {
  const { totalAmount } = req.body;

  const { client_secret } = await stripe.paymentIntents.create({
    amount: Number(totalAmount * 100),
    currency: "inr",
  });

  res.status(200).json({
    success: true,
    client_secret,
  });
});

export const createOrder = asyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentMethod,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
  } = req.body;

  // Check product stock before creating the order
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for one or more items",
      });
    }
  }

  const order = await Order.create({
    user: req.user._id,
    shippingInfo,
    orderItems,
    paymentMethod,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount,
  });

  // Update product stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    product.stock -= item.quantity;
    await product.save();
  }

  try {
    await sendEmail("Order Preparing", req.user.email, preparingTemplate(order));
  } catch (error) {
    console.error("Error sending email:", error);
  }

  res.status(201).json({
    success: true,
    message: "Order Placed Successfully",
  });
});


// export const createOrder = asyncError(async (req, res, next) => {
//   const {
//     shippingInfo,
//     orderItems,
//     paymentMethod,
//     paymentInfo,
//     itemsPrice,
//     taxPrice,
//     shippingCharges,
//     totalAmount,
//   } = req.body;

//   await Order.create({
//     user: req.user._id,
//     shippingInfo,
//     orderItems,
//     paymentMethod,
//     paymentInfo,
//     itemsPrice,
//     taxPrice,
//     shippingCharges,
//     totalAmount,
//   });

//   for (let i = 0; i < orderItems.length; i++) {
//     const product = await Product.findById(orderItems[i].product);
//     product.stock -= orderItems[i].quantity;
//     await product.save();
//   }

//   res.status(201).json({
//     success: true,
//     message: "Order Placed Successfully",
//   });
// });

export const getAdminOrders = asyncError(async (req, res, next) => {
  const orders = await Order.find({});

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getMyOrders = asyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getOrderDetails = asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ErrorHandler("Order Not Found", 404));

  res.status(200).json({
    success: true,
    order,
  });
});

export const proccessOrder = asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ErrorHandler("Order Not Found", 404));

  if (order.orderStatus === "Preparing") {
    order.orderStatus = "Shipped";
    
    try {
      await sendEmail("Order Shipped", req.user.email, shippedTemplate(order));
    } catch (error) {
      console.error("Error sending email:", error);
    }

  } else if (order.orderStatus === "Shipped") {
    order.orderStatus = "Delivered";
    order.deliveredAt = new Date(Date.now());

    try {
      await sendEmail("Order Delivered", req.user.email, deliveredTemplate(order));
    } catch (error) {
      console.error("Error sending email:", error);

    }

  } else {
    return next(new ErrorHandler("Order Already Delivered", 400));
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order Processed Successfully",
  });
});
// export const proccessOrder = asyncError(async (req, res, next) => {
//   const order = await Order.findById(req.params.id);
//   if (!order) return next(new ErrorHandler("Order Not Found", 404));

//   if (order.orderStatus === "Preparing") order.orderStatus = "Shipped";
//   else if (order.orderStatus === "Shipped") {
//     order.orderStatus = "Delivered";
//     order.deliveredAt = new Date(Date.now());
//   } else return next(new ErrorHandler("Order Already Delivered", 400));

//   await order.save();

//   res.status(200).json({
//     success: true,
//     message: "Order Processed Successfully",
//   });
// });
