import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Route, Link } from './node_modules/react-router-dom';

import ErrorBoundary from 'react-error-boundary';
import LinkedButton from '../../common/linked-button/linked-button';
import loadable from '@loadable/component';

import Loader from '../../common/loader.component';
import './login.scss';
import CONSTANTS from '../../../constants/constants';
import { buildLoginRequest } from './loginUtils';
import axios from 'axios';
import {getClient} from '../../ct/client.js';

const projectKey = CONSTANTS[0].CT_PROJECT_KEY;

const BreadCrumb = loadable(() => import(/* webpackChunkName: "bradcrumb" */ '../header/breadcrumb.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});

const Login = props => {

	console.log('Login props: ', props);

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);

	const handleEmailChange = event => {
		setEmail(event.target.value);
	}
	const handlePasswordChange = event => {
		setPassword(event.target.value);
	}

	const handleSubmit = event => {
		event.preventDefault();

		signinUser();
	}

	const getAccessTokenForUser =  async () => {

		const loginRequest = buildLoginRequest(email, password);

		console.log('===================')
		console.log(loginRequest.url);
		console.log(loginRequest.method);
		console.log(loginRequest.data);
		console.log('===================')

		axios.post(loginRequest.url, loginRequest.data, loginRequest.config)
			.then(result => {
				console.log('result', result);
				if (result.data.access_token) {
					const { from } = props.location.state || { from: { pathname: '/account' } };
					console.log('props.location.state: ', props.location.state);
					localStorage.setItem('user_token', JSON.stringify(result.data));
					localStorage.setItem('loginStatus', true);
					props.updateLoginStatus(true);
					props.history.push(from);
				}
			})
			.catch(function (e) {
				setError(true);
				setErrorMessage(e.message);
			});
	};

	const signinUser = async () => {

		//const cartReqUri= reqBuilder.carts.byCustomerId('e092703b-5199-43d1-b7dd-d96cf2694613').expand('discountCodes[*].discountCode').build();
		let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;

		const signinUserUri= '/'+projectKey+'/me/login';

		var signinReqBody = {};
		signinReqBody['email'] = email;
		signinReqBody['password'] = password;

		console.log('signinUserRequest : signinUserUri - '+signinUserUri+', signinReqBody : ', signinReqBody );

		const signinUserRequest = {
			uri: signinUserUri,
			method:'POST',
			body: signinReqBody,
			headers: {
				'Authorization': 'Bearer '+bearerToken
			}
		};

		await getClient().execute(signinUserRequest)
		.then(result => {
			console.log('result from CommerceTools: signinUserRequest : ', result);
			console.log('Customer ID : ', result.body.customer.id);

			getAccessTokenForUser();
		})
		.catch(function(e) {
			setError(true);
			setErrorMessage(e.message);	
		});
	};

	return (
		<React.Fragment>
			{/* <Header display={true} /> */}
			<main className="login">
				<header>
					<h1>Log In</h1>
				</header>
				<form className="" id="loginForm" onSubmit={handleSubmit}>
					<legend className="screen-reader">Login Details</legend>

					<fieldset>
						<label htmlFor="username">Username</label>
						<input type="text" name="username" id="username" value={email} onChange={handleEmailChange} placeholder="Enter Email Address" required />
					</fieldset>

					<fieldset>
						<label htmlFor="password">Password</label>
						<input type="password" name="password" id="password" value={password} onChange={handlePasswordChange} placeholder="Enter Password" required />
					</fieldset>
					<input type="submit" defaultValue="Log In" />
					<LinkedButton to="/">Cancel</LinkedButton>
					<hr />

					<h2>Don't have an account?</h2>
					<LinkedButton to="/register">Create Account</LinkedButton>
				</form>
			</main>
		</React.Fragment>
	);
};

export default Login;
