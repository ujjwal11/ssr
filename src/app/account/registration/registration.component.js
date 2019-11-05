import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Route, Link } from './node_modules/react-router-dom';

import ErrorBoundary from 'react-error-boundary';
import LinkedButton from '../../common/linked-button/linked-button';
import loadable from '@loadable/component';

import Loader from '../../common/loader.component';
import './registration.scss';
import CONSTANTS from '../../../constants/constants';
import { buildRegistrationRequest } from './registrationUtils';
import { buildLoginRequest } from '../../global/login/loginUtils';

import axios from 'axios';

const BreadCrumb = loadable(() => import(/* webpackChunkName: "bradcrumb" */ '../../global/header/breadcrumb.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});

const Registration = props => {

	console.log('Login props: ', props);

	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [favoriteColor, setFavoriteColor] = useState('');
	const [error, setError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);

	let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;

	const handleFirstNameChange = event => {
		setFirstName(event.target.value);
	}
	const handleLastNameChange = event => {
		setLastName(event.target.value);
	}
	const handleEmailChange = event => {
		setEmail(event.target.value);
	}
	const handlePasswordChange = event => {
		setPassword(event.target.value);
	}
	const handleFavoriteColorChange = event => {
		setFavoriteColor(event.target.value);
	}

	const handleSubmit = event => {
		event.preventDefault();

		let registrationRequestData = {
			email: email,
			password: password,
			firstName: firstName,
			lastName: lastName,
			custom: {
				type: {
					key: "user360",
					typeId: "type"
				},
				fields: {
					favoriteColor: favoriteColor
				}
			}
		}

		const registrationRequest = buildRegistrationRequest(bearerToken, registrationRequestData);

		console.log('===================')
		console.log(registrationRequest.url);
		console.log(registrationRequest.registrationRequest);
		console.log(registrationRequest.config);
		console.log('===================')

		axios.post(registrationRequest.url, registrationRequest.data, registrationRequest.config)
			.then(result => {
				console.log('result', result);
				if (result.data) {

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
				}
			})
			.catch(function (e) {
				setError(true);
				setErrorMessage(e.message);
			});
	}

	return (
		<React.Fragment>
			{/* <Header display={true} /> */}
			<main className="registration">
				<header>
					<h1>Create Account</h1>
				</header>
				<form className="" id="loginForm" onSubmit={handleSubmit}>
					<legend className="screen-reader">Login Details</legend>

					<fieldset>
						<label htmlFor="firstName">First Name</label>
						<input type="text" name="firstName" id="firstName" value={firstName} onChange={handleFirstNameChange} placeholder="Enter First Name" required />
					</fieldset>

					<fieldset>
						<label htmlFor="lastName">First Name</label>
						<input type="text" name="lastName" id="lastName" value={lastName} onChange={handleLastNameChange} placeholder="Enter Last Name" required />
					</fieldset>

					<fieldset>
						<label htmlFor="username">Username</label>
						<input type="text" name="username" id="username" value={email} onChange={handleEmailChange} placeholder="Enter Email Address" required />
					</fieldset>

					<fieldset>
						<label htmlFor="password">Password</label>
						<input type="password" name="password" id="password" value={password} onChange={handlePasswordChange} placeholder="Enter Password" required />
					</fieldset>
					<fieldset>
						<label htmlFor="favoriteColor">Favorite Color</label>
						<input type="text" name="favoriteColor" id="favoriteColor" value={favoriteColor} onChange={handleFavoriteColorChange} placeholder="Enter your favorite color" required />
					</fieldset>
					<input type="submit" defaultValue="Log In" />
					<LinkedButton to="/">Cancel</LinkedButton>
					<hr />

					<h2>Have an account?</h2>
					<LinkedButton to="/login">Sign In</LinkedButton>
				</form>
			</main>
		</React.Fragment>
	);
};

export default Registration;
