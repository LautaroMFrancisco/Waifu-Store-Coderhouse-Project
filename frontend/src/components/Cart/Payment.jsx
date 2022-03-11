import React, { Fragment, useState } from "react";
import MetaData from "../layout/MetaData/MetaData";
import "./styles.css";
import Checkout from "./Checkout";
import { createOrder } from "../../actions/orderActions";
import { useDispatch, useSelector } from "react-redux";

const Payment = ({ history }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");

  const { cartItems, shippingInfo } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const order = {
    orderItems: cartItems,
    shippingInfo,
  };

  const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo"));
  if (orderInfo) {
    order.itemsPrice = orderInfo.itemsPrice;
    order.shippingPrice = orderInfo.shippingPrice;
    order.taxPrice = orderInfo.taxPrice;
    order.totalPrice = orderInfo.totalPrice;
  }

  const submitHandler = (e) => {
    e.preventDefault();
    const min = 100000000;
    const max = 999999999;
    order.paymentInfo = {
      id: min + Math.random() * (max - min),
      status: "succeeded",
    };

    dispatch(createOrder(order));
    history.push("/success");
  };
  return (
    <Fragment>
      <MetaData title="Shipping info" />
      <Checkout shipping confirmOrder payment />

      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form className="shadow-lg" onSubmit={submitHandler}>
            <h1 className="mb-4">Card Info</h1>
            <div className="form-group">
              <label htmlFor="card_num_field">Card Number</label>
              <input
                type="text"
                id="card_num_field"
                className="form-control"
                value={cardNumber}
                onChange={(e) => {
                  setCardNumber(e.target.value);
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="card_exp_field">Card Expiry</label>
              <input
                type="text"
                id="card_exp_field"
                className="form-control"
                value={cardExpiry}
                onChange={(e) => {
                  setCardExpiry(e.target.value);
                }}
              />
            </div>
            {/*Should add validations*/}
            <div className="form-group">
              <label htmlFor="card_cvc_field">Card CVC</label>
              <input
                type="number"
                id="card_cvc_field"
                className="form-control"
                value={cardCVC}
                onChange={(e) => setCardCVC(e.target.value)}
              />
            </div>
            <button id="pay_btn" type="submit" className="btn btn-block py-3">
              Pay
            </button>
          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default Payment;
