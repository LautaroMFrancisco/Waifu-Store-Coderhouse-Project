import { useEffect } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/layout/Header/Header";
import Footer from "./components/layout/Footer/Footer";
import Home from "./components/Home/Home";
import ProductDetails from "./components/product/productDetails";
import Login from "./components/User/Login/Login";
import Register from "./components/User/Register/Register";
import { loadUser } from "./actions/userActions";
import store from "./store/store";
import Profile from "./components/User/Profile/Profile";
import ProtectedRoutes from "./components/Route/ProtectedRoutes";
import Cart from "./components/Cart/Cart";
import Shipping from "./components/Cart/Shipping";
import ConfirmOrder from "./components/Cart/ConfirmOrder";
import Payment from "./components/Cart/Payment";
import OrderSuccess from "./components/Cart/OrderSuccess";
import ListOrders from "./components/Order/ListOrders";
import OrderDetails from "./components/Order/OrderDetails";

function App() {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Router>
      <div className="App">
        <Header />
        <div className={"container container-fluid"}>
          <Route path="/" component={Home} exact />
          <Route path="/search/:keyword" component={Home} />
          <Route path="/product/:id" component={ProductDetails} exact />
          <Route path="/login" component={Login} exact />
          <Route path="/register" component={Register} exact />
          <Route path="/cart" component={Cart} exact />

          <ProtectedRoutes path="/shipping" component={Shipping} exact />
          <ProtectedRoutes path="/confirm" component={ConfirmOrder} exact />
          <ProtectedRoutes path="/success" component={OrderSuccess} exact />
          <ProtectedRoutes path="/payment" component={Payment} exact />

          <ProtectedRoutes path="/me" component={Profile} exact />
          <ProtectedRoutes path="/orders/me" component={ListOrders} exact />
          <ProtectedRoutes path="/order/:id" component={OrderDetails} exact />
        </div>
        <Footer />
      </div>
    </Router>
  );
}
export default App;
