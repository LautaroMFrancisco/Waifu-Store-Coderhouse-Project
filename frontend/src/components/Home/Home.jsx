import React, { Fragment, useEffect, useState } from "react";
import "./styles.css";
import MetaData from "../layout/MetaData/MetaData";

import { useDispatch, useSelector } from "react-redux";
import { getProduct } from "../../actions/productActions";
import Product from "../product/product";
import Loader from "../layout/Loader/Loader";
import { useAlert } from "react-alert";
import Pagination from "react-js-pagination";

const Home = ({ match }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useDispatch();
  const { loading, products, error, productsCount, resPerPage } = useSelector(
    (state) => state.products
  );
  const alert = useAlert();

  const keyword = match.params.keyword;

  useEffect(() => {
    if (error) {
      return alert.error(error);
    }
    dispatch(getProduct(keyword, currentPage));
  }, [dispatch, error, alert, currentPage, keyword]);

  const setCurrentPageNo = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={"Home"} />
          <h1 id="products_heading">Products</h1>
          <section id="products" className="container mt-5">
            <div className="row">
              {products &&
                products.map((product) => (
                  <Product key={product._id} product={product} />
                ))}
            </div>
          </section>
          {resPerPage < productsCount && (
            <div className={"d-flex justify-content-center mt-5"}>
              <Pagination
                activePage={currentPage}
                itemsCountPerPage={resPerPage}
                totalItemsCount={productsCount}
                onChange={setCurrentPageNo}
                itemClass={"page-item"}
                linkClass={"page-link"}
              />
            </div>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default Home;
