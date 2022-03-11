import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import Loader from "../../layout/Loader/Loader";
import MetaData from "../../layout/MetaData/MetaData";
import "./styles.css";

const Profile = () => {
  const { user, loading } = useSelector((state) => state.auth);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={"Your Profile"} />

          <h2 className="mt-5 ml-5">My Profile</h2>
          <div className="row justify-content-around mt-5 user-info">
            <div className="col-12 col-md-3">
              <figure className="avatar avatar-profile">
                <img
                  className="rounded-circle img-fluid"
                  src={user.avatar.url}
                  alt={user.name}
                />
              </figure>
            </div>

            <div className="col-12 col-md-5">
              <h4>Full Name</h4>
              <p>{user.name}</p>

              <h4>Email Address</h4>
              <p>{user.email}</p>

              <h4>Address</h4>
              <p>{user.address}</p>

              <h4>Country</h4>
              <p>{user.country}</p>

              <h4>Age</h4>
              <p>{user.age}</p>

              <h4>Phone</h4>
              <p>{user.phone}</p>

              {user.role !== "admin" && (
                <Link to="/orders/me" className="btn btn-danger btn-block mt-5">
                  My Orders
                </Link>
              )}
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Profile;
