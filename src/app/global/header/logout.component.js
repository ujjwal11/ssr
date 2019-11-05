import React, { useState, useEffect, useContext } from 'react';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import ErrorBoundary from 'react-error-boundary';
import loadable from '@loadable/component';
import store from 'store';

import './header.scss';
import CONSTANTS from '../../../constants/constants';
import Loader from '../../common/loader.component';

const Logout = props => {
	console.log('logout props: ', props);
	const { logoutPath, history, location, match, staticContext, to, ...rest } = props;

	console.log("loggedIn ----->" + props.loggedIn);

	const handleLogout = () => {
		store.remove('user_token');
		store.remove('loginStatus');
		props.history.push(logoutPath);
		props.updateLoginStatus(false);
	};

	return (
		<React.Fragment>
			{props.loggedIn ? (
				<React.Fragment>
					<span>Hi, ToDo!</span>
					<button type="button" onClick={handleLogout}>
						Logout
					</button>
				</React.Fragment>
			) : null}
		</React.Fragment>
	);
};

Logout.propTypes = {
	logoutPath: PropTypes.string.isRequired
};

export default withRouter(Logout);
