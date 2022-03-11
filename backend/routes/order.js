const express = require("express");
const router = express.Router();

const {
  newOrder,
  getSingleOrder,
  myOrder,
  allOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.route("/order/new").post(isAuthenticatedUser, newOrder);

router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);
router.route("/orders/me").get(isAuthenticatedUser, myOrder);
router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);
router
  .route("/admin/orders/")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allOrders);

module.exports = router;
