import React, { Fragment, useEffect, useState } from "react";
import { Carousel } from "react-bootstrap";
import "./styles.css";
import { useDispatch, useSelector } from "react-redux";
import { clearErrors, getProductDetails } from "../../actions/productActions";
import { useAlert } from "react-alert";
import Loader from "../layout/Loader/Loader";
import MetaData from "../layout/MetaData/MetaData";
import { addItemToCart } from "../../actions/cartActions";

const ProductDetails = ({ match }) => {
  const dispatch = useDispatch();
  const { loading, error, product } = useSelector(
    (state) => state.productsDetails
  );
  const alert = useAlert();

  const [stockQty, setStockQty] = useState(1);

  useEffect(() => {
    dispatch(getProductDetails(match.params.id));

    if (error) {
      alert.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, alert, error, match.params.id]);

  const increaseStock = () => {
    const count = document.querySelector(".count");

    if (count.valueAsNumber >= product.stock) return;

    const stock = count.valueAsNumber + 1;
    setStockQty(stock);
  };

  const decreaseStock = () => {
    const count = document.querySelector(".count");
    if (count.valueAsNumber <= 1) return;

    const stock = count.valueAsNumber - 1;
    setStockQty(stock);
  };

  const addToCart = () => {
    dispatch(addItemToCart(match.params.id, stockQty));
    alert.success("Item added successfully");
  };

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={product.name} />
          <div className="row f-flex justify-content-around">
            <div className="col-12 col-lg-5 img-fluid" id="product_image">
              <Carousel pause={"hover"}>
                {product.images &&
                  product.images.map((image) => (
                    <Carousel.Item key={image.public_id}>
                      <img
                        className={"d-block w-100"}
                        src={image.url}
                        alt={product.title}
                      />
                    </Carousel.Item>
                  ))}
              </Carousel>
            </div>

            <div className="col-12 col-lg-5 mt-5">
              <h3>{product.name}</h3>
              <p id="product_id">{product._id}</p>

              <hr />

              <p id="product_price">$ {product.price}</p>
              <div className="stockCounter d-inline">
                <span className="btn btn-danger minus" onClick={decreaseStock}>
                  -
                </span>
                <input
                  type="number"
                  className="form-control count d-inline"
                  value={stockQty}
                  readOnly
                />

                <span className="btn btn-primary plus" onClick={increaseStock}>
                  +
                </span>
              </div>
              <button
                type="button"
                id="cart_btn"
                className="btn btn-primary d-inline ml-4"
                disabled={product.stock === 0}
                onClick={addToCart}
              >
                Add to Cart
              </button>

              <hr />

              <p>
                Status:{" "}
                <span
                  id="stock_status"
                  className={product.stock > 0 ? "greenColor" : "redColor"}
                >
                  {product.stock > 0 ? "In Stock" : "Out Stock"}
                </span>
              </p>

              <hr />

              <h4 className="mt-2">Description:</h4>
              <p>{product.description}</p>
              <hr />
              <p id="product_seller mb-3">
                Sold by: <strong>{product.seller}</strong>
              </p>

              <div className="row mt-2 mb-5">
                <div className="rating w-50">
                  <div
                    className="modal fade"
                    id="ratingModal"
                    tabIndex="-1"
                    role="dialog"
                    aria-labelledby="ratingModalLabel"
                    aria-hidden="true"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default ProductDetails;
