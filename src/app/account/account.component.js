import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Route, Link, NavLink } from 'react-router-dom';

import ErrorBoundary from 'react-error-boundary';
import loadable from '@loadable/component';

import Loader from '../common/loader.component';
import './account.scss';
import CONSTANTS from '../../constants/constants';
import axios from 'axios';
import { buildMyAccountRequest } from './accountUtils';
import store from 'store';
// Loadable components
// const Header = loadable(() => import(/* webpackChunkName: "home" */ '../global/header/header.component'), {
// 	fallback: (
// 		<ErrorBoundary>
// 			<Loader />
// 		</ErrorBoundary>
// 	)
// });
// import CONSTANTS from '../../../constants/constants';

const BreadCrumb = loadable(() => import(/* webpackChunkName: "bradcrumb" */ '../global/header/breadcrumb.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});

const Account = props => {
	console.log('Account props: -->>', props);
	const [accountData, setAccountData] = useState({});
	const [favoriteColor, setFavoriteColor] = useState();

	let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;

	console.log(bearerToken);
	console.log("--------->>>>> " + typeof accountData.lastModifiedBy);

	useEffect(() => {
		let unmounted = false;
		let source = axios.CancelToken.source();

		if (accountData.email == undefined) {
			const fetchData = async () => {

				const myAccountRequest = buildMyAccountRequest(bearerToken);
				console.log("===================================");
				console.log(myAccountRequest.url);
				console.log(myAccountRequest.headerConfig);
				console.log("===================================");

				axios.get(myAccountRequest.url, myAccountRequest.headerConfig)
					.then(result => {
						console.log("Response -->" + JSON.stringify(result.data));
						if (!unmounted) {
							console.log('accountData: ', result.data);
							console.log('favoriteColor: ', result.data.custom.fields.favoriteColor);
							setAccountData(result.data);
							setFavoriteColor(result.data.custom.fields.favoriteColor)
							//props.handleWelcomeMessage(result.data.firstName);
						}
					})
					.catch(function (e) {
						if (!unmounted) {
							//setError(true);
							//setErrorMessage(e.message);
							if (axios.isCancel(e)) {
							} else {
							}
						}
					});
			};
			fetchData();
		}

		return function () {
			unmounted = true;
			source.cancel('Cancelling in cleanup');
		};
	}, [bearerToken, props, accountData]);

	return (
		<React.Fragment>
			{/* <Header display={true} /> */}
			<BreadCrumb display={props.breadcrumb} />
			<main className="myaccountpage">
				<nav className="left-nav">
					<h1>My Account</h1>
					<hr />
					<ul>
						<li>
							<a href="#">My Profile</a>
						</li>
						<li>
							<a href="#">Order History</a>
						</li>
						<li>
							<a href="#">Address Book</a>
						</li>
						<li>
							<a href="#">Payment Methods</a>
						</li>
						<li>
							<a href="#">Wish List</a>
						</li>
						<li>
							<a href="#">My XL Rewards</a>
						</li>
					</ul>
					<hr />
				</nav>

				<section>
					<article>
						<h2>My Orders</h2>
						<p>You have no previous orders</p>
					</article>

					<article>
						<h2>My Wish List</h2>
						<p>Wish List Settings</p>
					</article>

					<article>
						<h2>My Profile</h2>
						<fieldset>
							<legend>
								My Details
								<button type="button" id="edit">
									Edit
								</button>
							</legend>
							<p>
								{accountData.firstName} {accountData.lastName}
							</p>
							<p>{accountData.email}</p>
							<p>Preferred language: English</p>
							<p>Favorite color: {favoriteColor}</p>
						</fieldset>

						<fieldset>
							<legend>
								My Address Book
								<button type="button" id="new">
									New
								</button>
							</legend>
							<p>No addresses saved</p>
						</fieldset>
					</article>

					<form action="" method="" id="persona">
						<h3>My Details</h3>
						<p>To change your name or email address, click in the appropriate fields.</p>

						<fieldset>
							<label htmlFor="firstname">
								First Name:
								<input type="text" name="firstname" id="firstname" defaultValue="Eldorado" placeholder="Enter First Name" />
							</label>
							<label htmlFor="lastname">
								Last Name:
								<input type="text" name="lastname" id="lastname" defaultValue="Enchilada" placeholder="Enter Last Name" />
							</label>

							<label htmlFor="language">
								Preferred language:
								<select id="language" name="language">
									<option defaultValue="tr">TR - Turkish</option>
									<option defaultValue="de">DE - German</option>
									<option defaultValue="es">ES - Spanish</option>
									<option defaultValue="fr">FR - French</option>
									<option defaultValue="it">IT - Italian</option>
									<option defaultValue="en_GB">EN_GB - English (United Kingdom)</option>
									<option defaultValue="nl">NL - Dutch</option>
									<option defaultValue="pt">PT - Portguese (Portugal)</option>
									<option defaultValue="ja">JA - Japanese</option>
									<option defaultValue="en">EN - English</option>
								</select>
							</label>

							<label htmlFor="email">
								Email:
								<input type="email" name="email" id="email" placeholder="Enter Email Address" defaultValue="eldo@gmail.com" disabled />
							</label>

							<h4>Email Preferences</h4>

							<label htmlFor="emailUpdate">
								<input type="checkbox" name="emailUpdate" id="emailUpdate" defaultValue="I want to get email updates." />I want to get email updates.
							</label>

							<input type="submit" defaultValue="Save" />
							<input type="button" id="cancel" defaultValue="Cancel" />
						</fieldset>
					</form>

					<form action="" method="" id="addressForm">
						<fieldset>
							<label htmlFor="firstname" className="screen-reader">
								First Name:
							</label>
							<input type="text" name="firstname" id="firstname" defaultValue="Eldorado" placeholder="Enter First Name" />

							<label htmlFor="lastname" className="screen-reader">
								Last Name:
							</label>
							<input type="text" name="lastname" id="lastname" defaultValue="Enchilada" placeholder="Enter Last Name" />

							<label htmlFor="country" className="screen-reader">
								Country
							</label>
							<select id="country" name="language">
								<option defaultValue="">Country</option>
								<option defaultValue="US">United States</option>
							</select>

							<label htmlFor="address1" className="screen-reader">
								Address Line 1
							</label>
							<input type="text" name="address1" id="address1" defaultValue="" placeholder="Enter Address Line 1" />

							<label htmlFor="address2" className="screen-reader">
								Address Line 2
							</label>
							<input type="text" name="address2" id="address2" defaultValue="" placeholder="Enter Address Line 2" />

							<label htmlFor="city" className="screen-reader">
								City
							</label>
							<input type="text" name="city" id="city" defaultValue="" placeholder="Enter City" />

							<label htmlFor="state" className="screen-reader">
								State
							</label>
							<select id="state" name="state">
								<option defaultValue="">State/Region</option>
								<option defaultValue="alabama">Alabama</option>
								<option defaultValue="alaska">Alaska</option>
								<option defaultValue="texas">Texas</option>
							</select>

							<label htmlFor="zipcode" className="screen-reader">
								zipcode
							</label>
							<input type="text" name="zipcode" id="zipcode" defaultValue="" placeholder="Enter Zip/Postalcode" />

							<label htmlFor="phoneNumber" className="screen-reader">
								Phone Number
							</label>
							<input type="text" name="phoneNumber" id="phoneNumber" defaultValue="" placeholder="Enter Phone Number" />

							<input type="submit" defaultValue="Save" />
							<input type="button" id="cancel1" defaultValue="Cancel" />
						</fieldset>
					</form>

					<article>
						<label htmlFor="emailUpdate">
							<input type="checkbox" name="emailUpdate" id="emailUpdate" defaultValue="I want to get email updates." />I want to get email updates.
						</label>
					</article>

					<article>
						<h2>My Password</h2>
						<button type="button" id="edit1">
							Edit
						</button>
						<input type="password" id="currentPassword" placeholder="Enter Current Password" defaultValue="eldo123" disabled />
						<p>Use the form below to change the password for your account.</p>

						<form action="" id="changePasswordForm" method="">
							<input type="password" id="newPassword" placeholder="Enter New Password" required />
							<input type="password" id="confirmPassword" placeholder="Confirm New Password" required />

							<input type="submit" defaultValue="Save" />
							<input type="button" id="cancel2" defaultValue="Cancel" />
						</form>
					</article>
				</section>
			</main>
		</React.Fragment>
	);
};

export default Account;
