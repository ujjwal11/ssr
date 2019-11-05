import React, { useState, useEffect, useContext } from "react";
import { Link, Redirect } from "react-router-dom";

import ErrorBoundary from "react-error-boundary";
import loadable from "@loadable/component";
import store from "store";

import "./header.scss";
// import CONSTANTS from '../../../constants/constants';
import Loader from "../../common/loader.component";

const MegaNav = loadable(
  () => import(/* webpackChunkName: "mega-nav" */ "./mega-nav.component"),
  {
    fallback: (
      <ErrorBoundary>
        <Loader />
      </ErrorBoundary>
    )
  }
);

const Logout = loadable(
  () => import(/* webpackChunkName: "mega-nav" */ "./logout.component"),
  {
    fallback: (
      <ErrorBoundary>
        <Loader />
      </ErrorBoundary>
    )
  }
);

const Header = props => {
  console.log("header props: ", props);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  function handleSubmit(event) {
    const searchKeyWord = event.target.search.value;
    const url = "/searchresults?search=" + searchKeyWord;
    return <Redirect to={url} />;
  }

  return (
    <React.Fragment>
      <header className="masthead">
        <h1 className="logo">
          <Link to="/">
            <img
              src="/assets/img/ecomm360-logo.png"
              alt="Welcome to Commerce 360"
            />
          </Link>
        </h1>
        <div className="toggle-search">
          <a href="#search">Search</a>
        </div>
        <form className="search-box" onSubmit={handleSubmit}>
          <label htmlFor="search">Search</label>
          <input type="text" placeholder="Search" name="search" />
          <button type="submit">Submit</button>
        </form>
        <div>
          <div className="account-link">
            {props.loggedIn ? (
              <Logout
                loggedIn={props.loggedIn}
                updateLoginStaus={props.updateLoginStaus}
                userName={props.userName}
                logoutPath="/"
                {...props}
              />
            ) : null}
            {props.loggedIn ? (
              <Link to="/account">My Account</Link>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </div>
          <div className="cart-link">
            <Link to="/cart">Cart</Link>
          </div>
        </div>
        <div className="toggle-nav">
          <a href="#nav">Menu</a>
        </div>
        <MegaNav />
      </header>
    </React.Fragment>
  );
};

export default Header;
