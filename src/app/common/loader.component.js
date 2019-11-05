import React from 'react';

import './loader.scss';

const Loader = () => {
	return (
		<div className="wrap loader">
			<div className="loading">
				<div className="bounceball" />
				<div className="text">NOW LOADING</div>
			</div>
		</div>
	);
};

export default Loader;
