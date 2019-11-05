import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import ErrorBoundary from 'react-error-boundary';
import axios from 'axios';
import loadable from '@loadable/component';

import Loader from '../../common/loader.component';
import './plp.scss';
import CONSTANTS from '../../../constants/constants';
import { formatterService } from '../../common/formatter.service';

const BreadCrumb = loadable(() => import(/* webpackChunkName: "bradcrumb" */ '../../global/header/breadcrumb.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});

const Facets = loadable(() => import(/* webpackChunkName: "bradcrumb" */ './facets.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});

const ResultsList = props => {
	const [records, setRecords] = useState({ records: [] });
	const [sort, setSort] = useState('');
	const [facets, setFacets] = useState({ facets: [] });
	const [searchTerm, setSearchTerm] = useState(null);
	const [error, setError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);

	const currSort = sort;
	const path = props.location.pathname.split('/').pop();

	useEffect(() => {
		let unmounted = false;
		let source = axios.CancelToken.source();
		const { query } = getParams(props.location.search);
		const fetchSearchResults = async keyWord => {
			await axios(CONSTANTS[0].XAMPP_BASE_API + `search?No=0&Nrpp=12&Ntt=${keyWord}&suppressResults=false&Rdm=662&language=en&searchType=simple`, {
				cancelToken: source.token,
				timeout: CONSTANTS[0].AXIOS_TIMEOUT
			})
				.then(result => {
					if (!unmounted) {
						setRecords(result.data.resultsList);
						setFacets(result.data.navigation.navigation);
						setSearchTerm(result.data.searchAdjustments.originalTerms[0]);
						console.log('Search results: ', result.data);
					}
				})
				.catch(function(e) {
					if (!unmounted) {
						setError(true);
						setErrorMessage(e.message);
						if (axios.isCancel(e)) {
							console.log('e.message: ', e.message);
							//setData('Ooops, Something went wrong');
						} else {
							console.log('e.message: ', e.message);
							//setData('Ooops, Something went wrong');
						}
					}
				});
		};

		fetchSearchResults(query);

		function getParams(location) {
			const searchParams = new URLSearchParams(location);
			return {
				query: searchParams.get('search') || ''
			};
		}

		return function() {
			unmounted = true;
			source.cancel('Cancelling in cleanup');
		};
	}, [path, props.location.search]);

	return (
		<React.Fragment>
			<ErrorBoundary>
				<BreadCrumb display={props.breadcrumb} />
				<main className="plp">
					<header>
						<h1>Search Results for {searchTerm}</h1>
						<form id="loginForm">
							<fieldset>
								<legend className="screen-reader">Sort by</legend>
								<label htmlFor="sortBy" className="screen-reader">
									Sort
								</label>
								<select
									name="sort"
									id="sortBy"
									onChange={e => {
										console.log('e.target.value:', e.target.value);
										setSort(e.target.value);
									}}
								>
									<option value="">Default</option>
									<option value="&sort=listPrice%3Aasc">Price: Low to High</option>
									<option value="&sort=listPrice%3Adesc">Price: High to Low</option>
								</select>
							</fieldset>
						</form>
					</header>

					<Facets {...props} facets={facets} />
					<section>
						<ul className="product-list">
							{records.records.map(item => (
								<li key={item.attributes['product.repositoryId']}>
									{item.records.map(record => (
										<figure>
											<Link to={record.attributes['product.route'][0]} tabIndex="-1">
												<img src={CONSTANTS[0].DOMAIN + record.attributes['product.smallImageURLs'][0]} alt="placeholder image" />
											</Link>
											<figcaption>
												{/* {Object.keys(item.productVariantOptions[1].optionValueMap).length >= 1 ? (
													<ul className="colors">
														{Object.keys(item.productVariantOptions[1].optionValueMap).map((keyName, keyIndex) => (
															<li key={keyIndex} style={{ background: keyName }}>
																<span className="screen-reader">{keyName}</span>
															</li>
														))}
														{Object.keys(item.productVariantOptions[1].optionValueMap).length > 3 ? <li>2 more</li> : null}
													</ul>
												) : null} */}
												<Link to={record.attributes['product.route'][0]}>{record.attributes['product.displayName']}</Link>
												{record.attributes['sku.listPrice'] !== null && record.attributes['sku.salePrice'] === null ? <span>{formatterService.formatCurrency(record.attributes['sku.listPrice'], 'USD')}</span> : null}
												{record.attributes['sku.salePrice'] != null ? (
													<React.Fragment>
														<span className="sale">{formatterService.formatCurrency(record.attributes['sku.salePrice'], 'USD')}</span>
														<span>was {formatterService.formatCurrency(record.attributes['sku.listPrice'], 'USD')}</span>
													</React.Fragment>
												) : (
													<span>{formatterService.formatCurrency(record.attributes['sku.listPrice'], 'USD')}</span>
												)}

												<ul className="rating">
													<li>☆</li>
													<li>☆</li>
													<li>☆</li>
													<li>☆</li>
													<li>☆</li>
												</ul>
											</figcaption>
										</figure>
									))}
								</li>
							))}
							<li>
								<button>load more</button>
							</li>
						</ul>
					</section>
				</main>
			</ErrorBoundary>
		</React.Fragment>
	);
};

export default ResultsList;
