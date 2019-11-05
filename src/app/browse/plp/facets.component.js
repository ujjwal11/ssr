import React from 'react';
import { Link } from 'react-router-dom';

const Facets = props => {
	console.log('facet props: ', props);
	let facets = props.facets;

	// refactor to use facet passed in as argument, not what was created above
	const getfacets = (currFacets, currKey) => {
		console.log('currFacets: ', currFacets);
		let myFacet = [];

		if (currFacets['refinements'] && currFacets['refinements'] !== undefined) {
			currFacets['refinements'].map(key => {
				myFacet.push(
					<li key={Math.random()}>
						<Link to={key.link} data-link={key.link} onClick={e => props.onFacetClick(e, e.target.getAttribute('data-link'))}>
							{key.label} ({key.count})
						</Link>
					</li>
				);
			});
		} else {
			console.log("NO currFacets['refinements']: ", currFacets['refinements']);
		}

		return myFacet;
	};

	return (
		<nav className="secondary-nav">
			<div className="nav-container" id="facets">
				{typeof facets !== 'string' ? (
					Object.keys(facets).map((key, index) => (
						<ul key={index}>
							<li>
								<a href="#" className="accordian">
									{facets[key].displayName}
								</a>
							</li>
							{getfacets(facets[key], facets[key].displayName)}
						</ul>
					))
				) : (
					<p>{facets}</p>
				)}
			</div>

			<button tyle="button">Refine Results</button>
		</nav>
	);
};

export default Facets;
