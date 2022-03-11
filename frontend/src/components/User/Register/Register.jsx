import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert";
import { clearErrors, register } from "../../../actions/userActions";
import MetaData from "../../layout/MetaData/MetaData";
import "./styles.css";

const Register = ({ history }) => {
  const alert = useAlert();
  const dispatch = useDispatch();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    country: "",
    age: "",
  });

  const { name, email, password, phone, address, country, age } = user;

  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(
    "/images/waifu-avatar.png"
  );

  const { isAuthenticated, error, loading } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated) history.push("/");

    if (error) {
      alert.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, isAuthenticated, error, alert, history]);

  const submitHandler = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("name", name);
    formData.set("email", email);
    formData.set("password", password);
    formData.set("age", age);
    formData.set("country", country);
    formData.set("address", address);
    formData.set("phone", phone);
    formData.set("avatar", avatar);
    dispatch(register(formData));
  };

  const onChange = (e) => {
    if (e.target.name === "avatar") {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };
  return (
    <Fragment>
      <MetaData title={"Register"} />
      <div className="container container-fluid">
        <div className="row wrapper">
          <div className="col-10 col-lg-5">
            <form
              className="shadow-lg"
              onSubmit={submitHandler}
              encType="multipart/form-data"
            >
              <h1 className="mb-3">Register</h1>

              <div className="form-group">
                <label htmlFor="email_field">Name</label>
                <input
                  type="name"
                  id="name_field"
                  className="form-control"
                  name={"name"}
                  value={name}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email_field">Email</label>
                <input
                  type="email"
                  id="email_field"
                  className="form-control"
                  name={"email"}
                  value={email}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email_field">Address</label>
                <input
                  type="address"
                  id="address_field"
                  className="form-control"
                  name={"address"}
                  value={address}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email_field">Country</label>
                <input
                  type="country"
                  id="country_field"
                  className="form-control"
                  name={"country"}
                  value={country}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email_field">Phone</label>
                <input
                  type="number"
                  id="phone_field"
                  className="form-control"
                  name={"phone"}
                  value={phone}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email_field">Age</label>
                <input
                  type="age"
                  id="age_field"
                  className="form-control"
                  name={"age"}
                  value={age}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password_field">Password</label>
                <input
                  type="password"
                  id="password_field"
                  className="form-control"
                  name={"password"}
                  value={password}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="avatar_upload">Avatar</label>
                <div className="d-flex align-items-center">
                  <div>
                    <figure className="avatar mr-3 item-rtl">
                      <img
                        src={avatarPreview}
                        className="rounded-circle"
                        alt="Avatar Preview"
                      />
                    </figure>
                  </div>
                  <div className="custom-file">
                    <input
                      type="file"
                      name="avatar"
                      className="custom-file-input"
                      id="customFile"
                      accept={"images/*"}
                      onChange={onChange}
                    />
                    <label className="custom-file-label" htmlFor="customFile">
                      Choose Avatar
                    </label>
                  </div>
                </div>
              </div>

              <button
                id="register_button"
                type="submit"
                className="btn btn-block py-3"
                disabled={loading ? true : false}
              >
                REGISTER
              </button>
            </form>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Register;
