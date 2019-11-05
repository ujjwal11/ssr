import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';

import ErrorBoundary from 'react-error-boundary';
import loadable from '@loadable/component';
import store from 'store';
import axios from 'axios';

import CONSTANTS from '../constants/constants';
import Loader from './common/loader.component';
import { PrivateRoute } from './PrivateRoute';

import { buildAnonymousTokenRequest } from "./appUtils";

// Loadable components
const Header = loadable(() => import(/* webpackChunkName: "header" */ './global/header/header.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});

const Home = loadable(() => import(/* webpackChunkName: "home" */ './home/home.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});
const Footer = loadable(() => import(/* webpackChunkName: "footer" */ './global/footer/footer.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});
const PLP = loadable(() => import(/* webpackChunkName: "plp" */ './browse/plp/plp.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});
const ResultsList = loadable(() => import(/* webpackChunkName: "plp" */ './browse/plp/reslutslist.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});
const PDP = loadable(() => import(/* webpackChunkName: "pdp" */ './browse/pdp/pdp.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});
const Cart = loadable(() => import(/* webpackChunkName: "cart" */ './cart-checkout/cart.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});
const Checkout = loadable(() => import(/* webpackChunkName: "checkout" */ './cart-checkout/checkout.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});
const Account = loadable(() => import(/* webpackChunkName: "account" */ './account/account.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});
const Login = loadable(() => import(/* webpackChunkName: "login" */ './global/login/login.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});
const Registration = loadable(() => import(/* webpackChunkName: "login" */ './account/registration/registration.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});

export const InitSession = async () => {
	console.log("Init user session...");
	const anonymousTokenRequest = buildAnonymousTokenRequest();
	console.log("===================");
	console.log(anonymousTokenRequest.url);
	console.log(anonymousTokenRequest.method);
	console.log(anonymousTokenRequest.data);
	console.log(anonymousTokenRequest.headerConfig);
	console.log("===================");

	const result = await axios.post(anonymousTokenRequest.url, anonymousTokenRequest.data, anonymousTokenRequest.config)
		
		console.log("result", result.data);
		if (result.data) {
			localStorage.setItem("user_token", JSON.stringify(result.data));
		}

};

const App = props => {
	const [registry, setRegistry] = useState({ registry: [] });
	const [site, setSite] = useState({ site: [] });
	const [priceGroup, setPriceListGroup] = useState({ priceGroup: [] });
	const [loggedIn, setLoggedIn] = useState(localStorage.getItem('loginStatus') == 'true' ? true : false);
	const [userName, setUserName] = useState('Hi');
	const [error, setError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);

	const [breadcrumb, setbreadcrumb] = useState(false);

	console.log(loggedIn);

	useEffect(() => {
		let unmounted = false;
		//let source = axios.CancelToken.source();

		const init =  async () => {
			const user_token = localStorage.getItem("user_token");
			if (user_token == null) {
				await InitSession();
			}
		}
		
		init()
		//fetchData();
		//fetchSite();
		setbreadcrumb(true);

		return function () {
			unmounted = true;
			//source.cancel('Cancelling in cleanup');
		};
	}, [error, errorMessage, props]);

	

	const updateLoginStatus = loginStatus => {
		console.log('loginStatus: ', loginStatus);
		setLoggedIn(loginStatus);
		if (!loginStatus) {
			//new session after logout
			InitSession();
		}
	};

	const handleWelcomeMessage = userName => {
		console.log('loginStatus: ', userName);
		setUserName(userName);
	};

	return (
		<Router>
			<Header display={props.breadcrumb} loggedIn={loggedIn} logoutPath="/" {...props} updateLoginStatus={updateLoginStatus} userName={userName} />
			<Route path="/" exact component={props => <Home {...props} breadcrumb={false} registry={registry} site={site} priceGroup={priceGroup} loggedIn={loggedIn} />} />
			<Route path="/home" exact component={props => <Home {...props} breadcrumb={false} registry={registry} site={site} priceGroup={priceGroup} loggedIn={loggedIn} />} />
			<Route path="/:sub/category/:cat" exact component={props => <PLP {...props} breadcrumb={true} registry={registry} site={site} priceGroup={priceGroup} loggedIn={loggedIn} />} />
			<Route path="/:name/product/:id" exact component={props => <PDP {...props} breadcrumb={true} registry={registry} site={site} priceGroup={priceGroup} loggedIn={loggedIn} />} />
			<Route path="/searchresults" exact component={props => <ResultsList {...props} breadcrumb={true} registry={registry} site={site} priceGroup={priceGroup} loggedIn={loggedIn} />} />
			<Route path="/cart" exact component={props => <Cart {...props} breadcrumb={true} registry={registry} site={site} priceGroup={priceGroup} loggedIn={loggedIn} />} />
			<Route path="/checkout/shipping" exact component={props => <Checkout {...props} breadcrumb={true} registry={registry} site={site} priceGroup={priceGroup} checkoutPath="shipping" loggedIn={loggedIn} />} />
			<Route path="/checkout/payment" exact component={props => <Checkout {...props} breadcrumb={true} registry={registry} site={site} priceGroup={priceGroup} checkoutPath="payment" loggedIn={loggedIn} />} />
			<PrivateRoute exact path="/account" component={props => <Account {...props} breadcrumb={true} registry={registry} site={site} priceGroup={priceGroup} loggedIn={loggedIn} handleWelcomeMessage={handleWelcomeMessage} />} />
			<Route path="/login" exact component={props => <Login {...props} breadcrumb={true} registry={registry} site={site} priceGroup={priceGroup} loggedIn={loggedIn} updateLoginStatus={updateLoginStatus} />} />
			<Route path="/register" exact component={props => <Registration {...props} breadcrumb={true} registry={registry} site={site} priceGroup={priceGroup} loggedIn={loggedIn} updateLoginStatus={updateLoginStatus} />} />
			<Route path="/checkout/review" exact component={props => <Checkout {...props} breadcrumb={true} registry={registry} site={site} priceGroup={priceGroup} checkoutPath="review" loggedIn={loggedIn} />} />
			<Route path="/checkout/confirmation" exact component={props => <Checkout {...props} breadcrumb={true} registry={registry} site={site} priceGroup={priceGroup} checkoutPath="confirmation" loggedIn={loggedIn} />} />
			<Footer />
		</Router>
	);
};

export default App;

