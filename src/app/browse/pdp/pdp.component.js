import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { BrowserRouter as Router, Route, Link, NavLink } from 'react-router-dom';

import axios from 'axios';
import ErrorBoundary from 'react-error-boundary';
import loadable from '@loadable/component';

import Loader from '../../common/loader.component';
import CONSTANTS from '../../../constants/constants';
import { formatterService } from '../../common/formatter.service';
import './pdp.scss';
import { createRequestBuilder } from '@commercetools/api-request-builder';
import {getClient} from '../../ct/client.js';
import {InitSession} from '../../app'

const projectKey = CONSTANTS[0].CT_PROJECT_KEY;
const reqBuilder = createRequestBuilder({projectKey});

// Loadable components
const BreadCrumb = loadable(() => import(/* webpackChunkName: "bradcrumb" */ '../../global/header/breadcrumb.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});

function getDiscout(price, salePrice) {
	let val = (salePrice / price) * 100;
	return Math.floor(val);
}

function setDefaultColor() {
	let selectedColor = document.querySelector('.color.selected-option span').innerText;
	const colorHeader = document.querySelector('.product-swatches h2 strong');
	const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

	selectedColor = capitalize(selectedColor);

	colorHeader.innerHTML = selectedColor;
}

function selectOption(e, option) {
	const colors = document.querySelectorAll(`.${option}`);

	colors.forEach(val => {
		val.classList.remove('selected-option');
	});

	e.target.parentElement.classList.add('selected-option');

	if (option === 'color') {
		setDefaultColor();
	}
}

function handleProductImg(e) {
	e.preventDefault();
	const selectedImg = e.target.dataset.largeUrl;
	const fullImg = document.querySelector('.product-carousel-img img');
	console.log(fullImg.src);
	fullImg.src = selectedImg;
}

const PDP = props => {
	// console.log('PDP props: ', props);
	const prodSlug = props.location.pathname.split('/').pop();
	const [product, setProduct] = useState({});
	const [thumbs, setThumbs] = useState([]);
	const [sizes, setSizes] = useState([]);
	const [colors, setColors] = useState([]);
	const [error, setError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);
	const path = props.location.pathname.split('/').pop();

	useEffect(() => {
		let unmounted = false;
		

		const fetchData = async () => {
			if (!localStorage.getItem('user_token')) {
				await InitSession()
			}
			let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;
			const prodProjectionById= reqBuilder.productProjections.where(`slug(en="${prodSlug}")`).build()

			console.log("url"+prodProjectionById);
			const productProjectionBySlugReq = {
				uri: prodProjectionById,
				method:'GET',
				headers: {
					'Authorization': 'Bearer '+bearerToken
				}
			};
			await getClient().execute(productProjectionBySlugReq)
				.then(result => {
					if (!unmounted) {
						if (result.body.results && result.body.results.length > 0) {
							setProduct(result.body.results[0]);
							const images = new Set();
							const colors = new Set();
							const sizes = new Set()
							for (let variant of result.body.results[0].variants) {
								for (let img of variant.images) {
									images.add(img.url)
								}

								variant.attributes.filter(attr => attr.name === 'color' ).map(color => {
									colors.add(color.value.key)
								})

								variant.attributes.filter(attr => attr.name === 'size' ).map(size => {
									sizes.add(size.value)
								})
								
							}
							setThumbs(Array.from(images))
							setColors(Array.from(colors))
							setSizes (Array.from(sizes))
							
						}
						
						setDefaultColor();
					}
				})
				.catch(function(e) {
					if (!unmounted) {
						setError(true);
						setErrorMessage(e.message);
						
					}
				});
		};

		fetchData();

		return function() {
			unmounted = true;
			
		};
	}, [error, errorMessage, path]);

	function addToCart() {
		let selectedOptions = document.querySelectorAll('.selected-option');
		console.log(selectedOptions, 'selectedOptions')
		const qty = document.querySelector('#qty option:checked').value;
		const color = document.querySelector('.color.selected-option');
		const size = document.querySelector('.size.selected-option');
		let selectedOptionsArr = [];

		let childSKU;
					
		for (let variant of product.variants) {
			const sizeAttr = variant.attributes.filter(attr => attr.name === 'size')[0];
			console.log('asdasd', sizeAttr)
			const colorAttr = variant.attributes.filter(attr => attr.name === 'color')[0];
			if (sizeAttr.value === size.dataset.key && colorAttr.value.key === color.dataset.val) {
				childSKU = variant
				console.log('asdasdasdasdas', variant)
			}
		}
	
		let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;
		console.log('bearerToken',bearerToken)
		const getCart = async () => {
			let activeCart = {};
			const cartReqUri= reqBuilder.myCarts.build();

			const getCartRequest = {
				uri: cartReqUri,
				method:'GET',
				headers: {
					'Authorization': 'Bearer '+bearerToken
				}
			};

			const result = await getClient().execute(getCartRequest)

			var activeCarts = result.body.results.filter(cart => cart.cartState === 'Active');
			if(activeCarts.length > 0){
				activeCart = activeCarts[0];
			} else {
				activeCart = await createCart()
			}

			return activeCart
			
		}
		

		const createCart = async () => {
		
			const cartReqUri= reqBuilder.myCarts.build();
			const body = {}
			body["currency"]= "EUR"
			body["shippingAddress"] = {"country":"DE"}
			 
			const createCartRequest = {
				uri: cartReqUri,
				method:'POST',
				headers: {
					'Authorization': 'Bearer '+bearerToken
				},
				body: body
			};

			const response = await getClient().execute(createCartRequest)
			
			return response.body;
		}

		const addItemToCart = async () => {

			const activeCart = await getCart();
			
			const cartReqUri= reqBuilder.myCarts.byId(activeCart.id).build();
			const bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;
			const updateCartRequest = {
				uri: cartReqUri,
				method: 'POST',
				headers: {
					'Authorization': 'Bearer '+bearerToken
				},
				body: {
				  "version": activeCart.version,
				  "actions":[
					{
					  "action": "addLineItem",
					  "sku": childSKU.sku
					  
					}
				  ]
				}
			  };

			const result = await getClient().execute(updateCartRequest)
				.then(response => {
					//console.log('response', JSON.parse(response.body));
					alert('item '+ childSKU.sku +' was added to the cart')
				})
				.catch(error => {
					console.error('error', error);
				});
		};

		addItemToCart();
	}

	return (
		<React.Fragment>
			<ErrorBoundary>
				<BreadCrumb display={props.breadcrumb} />

				<main className="pdp">
					<h1>{product.name !== undefined ? product.name.en : ""}</h1>

					<section className="product-carousel">
						<div className="product-carousel-thumbs">
							<ul>
								{thumbs.map((img,key) => {
									return (
										<li key={key}>
											<Link to="#" data-testy={img} onClick={e => handleProductImg(e)}>
												<img src={img}  alt="product thumbnail" className="selected" />
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
						{/*<div className="product-carousel-img">
							<img src={CONSTANTS[0].DOMAIN + product.primaryFullImageURL} alt={product.primaryImageAltText} />
							</div>*/}
					</section>
					<section className="product-details">
						<h1>{product.displayName}</h1>
						{product.salePrice ? (
							<div className="price">
								<div className="sale-price">{formatterService.formatCurrency(product.salePrice, 'EUR')}</div>
								<div className="list-price">
									<del>{formatterService.formatCurrency(product.listPrice, 'EUR')}</del>
								</div>
								<div className="discount">{getDiscout(product.listPrice, product.salePrice)}% off!</div>
							</div>
						) : (
							<div className="price">
								<div className="list-price">{product.listPrice}</div>
							</div>
						)}
						<div className="product-swatches">
							<h2>
								Color: <strong />
							</h2>
							{colors.map((color, key) => {
								return (
									<label key={key} htmlFor={color} className={key === 0 ? 'color selected-option' : 'color'} style={{ backgroundColor: key }} data-option="color" data-key={key} data-val={colors[key]}>
										<input type="text" name={color} id={color} onClick={e => selectOption(e, 'color')} />
										<span className="screen-reader">{color}</span>
									</label>
								);
							})}
						</div>
						<div className="product-size">
							<h2>Size:</h2>
							{sizes.map((key, index) => {
								return (
									<label key={index} htmlFor={key} className={index === 0 ? 'size selected-option' : 'size'} data-option="size" data-key={key} data-val={sizes[key]}>
										<input type="text" name={key} id={key} onClick={e => selectOption(e, 'size')} />
										<span>{key}</span>
									</label>
								);
							})}
						</div>
						<div className="product-qty">
							<h2>Qty:</h2>
							<select name="" id="qty">
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4">4</option>
								<option value="5">5</option>
								<option value="6">6</option>
								<option value="7">7</option>
								<option value="8">8</option>
								<option value="9">9</option>
								<option value="10">10</option>
							</select>
						</div>
						<input type="hidden" id="repoId" value={product.repositoryId} />
						<div className="btn-group">
							<button className="add-cart" onClick={addToCart}>
								Add to cart
							</button>
							<button className="add-wishlist">Add to wishlist</button>
						</div>
						<div className="desc">
							<div dangerouslySetInnerHTML={{ __html: product.longDescription }} />
						</div>
					</section>

					{/* <section className="ftb">
						<h1>Frequently Bought Together</h1>
						<ul>
							<li>
								<figure>
									<img src="https://via.placeholder.com/220" alt="placeholder image" />
									<figcaption>
										<a href="#">
											<strong>Cowl Neck Tweed Pullover</strong>
										</a>
										<del>$169.00</del>
										<span>$110.99</span>
									</figcaption>
								</figure>
							</li>
							<li>
								<figure>
									<img src="https://via.placeholder.com/220" alt="placeholder image" />
									<figcaption>
										<a href="#">
											<strong>Scoop Neck Knit Top</strong>
										</a>
										<del>$169.00</del>
										<span>$110.99</span>
									</figcaption>
								</figure>
							</li>
							<li>
								<figure>
									<img src="https://via.placeholder.com/220" alt="placeholder image" />
									<figcaption>
										<a href="#">
											<strong>Scoop Neck Knit Top</strong>
										</a>
										<del>$169.00</del>
										<span>$110.99</span>
									</figcaption>
								</figure>
							</li>
							<li>
								<figure>
									<img src="https://via.placeholder.com/220" alt="placeholder image" />
									<figcaption>
										<a href="#">
											<strong>Cowl Neck Tweed Pullover</strong>
										</a>
										<del>$169.00</del>
										<span>$110.99</span>
									</figcaption>
								</figure>
							</li>
							<li>
								<figure>
									<img src="https://via.placeholder.com/220" alt="placeholder image" />
									<figcaption>
										<a href="#">
											<strong>Quilted Jacket</strong>
										</a>
										<del>$169.00</del>
										<span>$110.99</span>
									</figcaption>
								</figure>
							</li>
						</ul>
					</section> */}
				</main>
			</ErrorBoundary>
		</React.Fragment>
	);
};

export default PDP;
