const Order = require("../models/order");
const Product = require("../models/product");
const { createTransport } = require("nodemailer");
const twilioClient = require("twilio")("", "");
const loggerConsole = require("../utils/loggerSetup");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");

// Create A New Order = /api/v1/order/new

exports.newOrder = catchAsyncError(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
  } = req.body;

  loggerConsole.trace(
    "A new order has been created by user ID: " + req.user._id
  );

  // SETTING UP  GMAIL SERVICE
  const transporter = createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: process.env.NODE_EMAIL,
      pass: process.env.NODE_PASS,
    },
  });
  // PARSING ITEMS THAT THE FRONT END SENDS FOR EMAIL
  const parsedOrders = orderItems.map((i) => {
    return `<ul>
                    <li>Item Name: ${i.name} </li>
                    <li>Quantity: ${i.quantity}</li>
                    <li>Price: ${i.price}</li>
                  </ul>`;
  });
  // PARSING ITEMS THAT THE FRONT END SENDS FOR WHATSAPP

  const parsedOrdersWssp = orderItems.map((i) => {
    return `
    Item Name: ${i.name}
    Quantity: ${i.quantity}
    Price: ${i.price}
    `;
  });

  // SETTING UP EMAIL BODY

  const mailOptions = {
    from: "Waifu BoT Beep-Boop Purchase Notifier",
    to: process.env.NODE_EMAIL,
    subject: `A new order has been place`,
    html: `<h1 style="color: purple;">We have an order in our website!</h1>
    
        <p>The user has places the following order: </p>
     
          ${parsedOrders}
        
        <p> It-it's not like I wanted to tell you all of this. B-Baka! </p>`,
  };

  // SETTING UP WHATSAPP BODY

  const wspMessage = {
    body: "Hey Admin, wake up! We have a new order: " + parsedOrdersWssp,
    from: "",
    to: "",
  };

  // SETTING UP SMS BODY

  const smsMessage = {
    body: `Hello ! We have received your order and it's being processed, thanks for shopping with us!  `,
    from: "whatsapp:+14155238886",
    to: "whatsapp:+5491131550684",
  };

  // EMAIL TO ADMIN
  await transporter.sendMail(mailOptions);
  // WSP TO ADMIN
  await twilioClient.messages.create(wspMessage);
  /* // MSG TO CLIENT
  await twilioClient.messages.create(smsMessage);*/

  loggerConsole.error("Error on /checkout");

  const order = await Order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user._id,
  });
  res.status(200).json({
    success: true,
    order,
  });
});

// Get A Single Order => /api/v1/order/:id

exports.getSingleOrder = catchAsyncError(async function (req, res, next) {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) return next(new ErrorHandler("No Order Found With This ID", 404));

  res.status(200).json({
    success: true,
    order,
  });
});

// Get Logged Used Order => /api/v1/order/me

exports.myOrder = catchAsyncError(async function (req, res, next) {
  const order = await Order.find({ user: req.user.id });

  if (!order) return next(new ErrorHandler("No Orders Found", 404));

  res.status(200).json({
    success: true,
    order,
  });
});

// Get All Orders For Admin => /api/v1/admin/orders/
exports.allOrders = catchAsyncError(async function (req, res, next) {
  const order = await Order.find();

  if (!order) return next(new ErrorHandler("No Orders Found", 404));

  let totalAmount = 0;

  order.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    order,
  });
});

// Update / Process Order - ADMIN => /api/v1/admin/order/:id

exports.updateOrder = catchAsyncError(async function (req, res, next) {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === "Delivered")
    return next(new ErrorHandler("You have already delivered this order", 404));

  order.orderItems.forEach(async (item) => {
    await updateStock(item.product, item.quantity);
  });

  order.orderStatus = req.body.status;
  order.deliveredAt = Date.now();

  await order.save();

  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock = product.stock - quantity;
  await product.save({ validateBeforeSave: false });
}

// Delete Order => /api/v1/admin/order/:id

exports.deleteOrder = catchAsyncError(async function (req, res, next) {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ErrorHandler("No Order Found With This ID", 404));

  await order.remove();

  res.status(200).json({
    success: true,
    order,
  });
});
