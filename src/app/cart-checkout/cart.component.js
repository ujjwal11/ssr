import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import axios from 'axios';
import ErrorBoundary from 'react-error-boundary';
import loadable from '@loadable/component';

import Loader from '../common/loader.component';
import CONSTANTS from '../../constants/constants';
import { formatterService } from '../common/formatter.service';
import LinkedButton from '../common/linked-button/linked-button';

import './cart.scss';
import { async } from 'q';

import { createRequestBuilder } from '@commercetools/api-request-builder';
import {getClient} from '../ct/client.js';
const projectKey = CONSTANTS[0].CT_PROJECT_KEY;
const BreadCrumb = loadable(() => import(/* webpackChunkName: "bradcrumb" */ '../global/header/breadcrumb.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});
const Cart = props => {
	console.log('cart props: ', props);
	
	const [cartData, setCartData] = useState({ items: [] });
	const [orderTotal, setOrderTotal] = useState(0);
	const [currencyCode, setCurrencyCode] = useState('USD');
	const [error, setError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);
	const [cartVersion, setCartVersion] = useState(0);
	const [cartId, setCartId] = useState(0);
	const [cartItemsCount, setCartItemsCount] = useState(0);

	const [giftMsg, setGiftMsg] = useState('');

	const [couponCode, setCouponCode] = useState('');
	const [couponApplied, setCouponApplied] = useState('false');
	const [couponId, setCouponId] = useState('');	
	const [couponDesc, setCouponDesc] = useState('');	

	const reqBuilder = createRequestBuilder({projectKey});

	let unmounted = false;	

	useEffect(() => {
		
		
		fetchCartFromCt(unmounted);	

		return function() {
			unmounted = true;
		};		
	}, [error, errorMessage]);

	const fetchCartFromCt = async (unmounted) => {

		//const cartReqUri= reqBuilder.carts.byCustomerId('e092703b-5199-43d1-b7dd-d96cf2694613').expand('discountCodes[*].discountCode').build();
		let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;

		const cartReqUri= reqBuilder.myCarts.expand('discountCodes[*].discountCode').expand('paymentInfo.payments[*]').build();

		const getCartRequest = {
			uri: cartReqUri,
			method:'GET',
			headers: {
				'Authorization': 'Bearer '+bearerToken
			}
		};

		await getClient().execute(getCartRequest)
		.then(result => {
			if (!unmounted) {
				let activeCart = {};
				console.log('result from CommerceTools: ', result);
				
				var activeCarts = result.body.results.filter(cart => cart.cartState === 'Active');
				if(activeCarts.length > 0){
					//TODO Pick the current Cart
					activeCart = activeCarts[0];
				}else {
					//TODO Create Cart API

				}
				 
				setCartData(activeCart);
				setOrderTotal(activeCart.taxedPrice.totalGross.centAmount);
				setCurrencyCode(activeCart.totalPrice.currencyCode);
				setCartVersion(activeCart.version);
				setCartId(activeCart.id);
				
				setCartItemsCount(findCartItemsCount(activeCart));	
				if(activeCart.custom && activeCart.custom.fields.giftMessage){
					setGiftMsg(''+activeCart.custom.fields.giftMessage.en);
				}
				
				if (activeCart.discountCodes) {
					if(activeCart.discountCodes.length > 0) {
						setCouponApplied('true');     
						setCouponCode(activeCart.discountCodes[0].discountCode.obj.code);		
						setCouponId(activeCart.discountCodes[0].discountCode.id);	
						setCouponDesc(activeCart.discountCodes[0].discountCode.obj.description.en);										
					}else {
						setCouponApplied('false'); 
						setCouponCode('');	
						setCouponId('');
						setCouponDesc('');							
					}
				}
				console.log('discount code id'+ activeCart.discountCodes[0].discountCode.id);
				console.log('result from CommerceTools: ', result);				

			}

		})
		.catch(function(e) {
			if (!unmounted) {
				setError(true);
				setErrorMessage(e.message);					
			}
		});
	};

	const renderQuantity = qty => {
		console.log('renderQuantity', qty);
		let options = [];
		let defaultQty = 10;
		for (let i = 0; i <= defaultQty; i++) {
			options.push(
				<option key={i} value={i}>
					{i}
				</option>
			);
		}
		return options;
	};

	const toggleActive = (e) => {
		console.log('e.currentTarget.classList', e.currentTarget.classList);
		e.currentTarget.classList.toggle('active');
		var content = e.currentTarget.nextElementSibling;
		if (content.style.maxHeight) {
			content.style.maxHeight = null;
		} else {
			content.style.maxHeight = content.scrollHeight + 'px';
		}
	}

	const findCartItemsCount = response => {
		var totalQty = 0;
		if(response.lineItems) { 
			let result = response.lineItems.map(a => a.quantity);
			totalQty = totalQty + result.reduce((a, b) => a + b, 0);
		}

		return totalQty;
	}
	const updateItemQtyCart = async (e) => {

		const lineItemId = e.currentTarget.id;
		const lineItemQty = parseInt(e.currentTarget.value, 10);
		let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;

		console.log('Update Item '+lineItemId+' from Cart id : '+cartId+ ' Version : '+cartVersion);
		const cartReqUri= reqBuilder.myCarts.byId(cartId).build();

		const updateLineItemBody = {};
		updateLineItemBody['version'] = cartVersion;
		
		//create action for the request
		var updateLineItemAction = {};
		updateLineItemAction['action'] = 'changeLineItemQuantity';
		updateLineItemAction['lineItemId'] = lineItemId;
		updateLineItemAction['quantity'] = lineItemQty;

		const actions = [updateLineItemAction];
		updateLineItemBody['actions'] = actions;
		
		

		const updateLineItemReq = {
			uri: cartReqUri,
			method: 'POST',
			body: updateLineItemBody,
			headers: {
				'Authorization': 'Bearer '+bearerToken
			}
		};
		console.log('cartReqUri', cartReqUri);
		console.log('updateLineItemAction : ', updateLineItemAction);
		
		await getClient().execute(updateLineItemReq)
		.then(result => {
			setCartData(result.body);
			setOrderTotal(result.body.taxedPrice.totalGross.centAmount);
			setCurrencyCode(result.body.totalPrice.currencyCode);
			setCartVersion(result.body.version);
			setCartId(result.body.id);
			setCartItemsCount(findCartItemsCount(result.body));
			setGiftMsg(result.body.custom.fields.giftMessage.en);
			console.log('result from CommerceTools: ', result);

			
		})
		.catch(function(e) {
			setError(true);
			setErrorMessage(e.message);	
		});
	};

	const removeItemFromCart = async (e) => {
		const lineItemId = e.currentTarget.id;
		console.log(e);
		
		console.log('Remove Item '+lineItemId+' from Cart id : '+cartId+ ' Version : '+cartVersion);
		const cartReqUri= reqBuilder.myCarts.byId(cartId).build();

		const removeLineItemBody = {};
		removeLineItemBody['version'] = cartVersion;
		
		//create action for the request
		var removeLineItemAction = {};
		removeLineItemAction['action'] = 'removeLineItem';
		removeLineItemAction['lineItemId'] = lineItemId;

		const actions = [removeLineItemAction];
		removeLineItemBody['actions'] = actions;
		
		let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;

		const removeLineItemReq = {
			uri: cartReqUri,
			method: 'POST',
			body: removeLineItemBody,
			headers: {
				'Authorization': 'Bearer '+bearerToken
			}
		};
		console.log('cartReqUri', cartReqUri);
		console.log('removeLineItemAction', removeLineItemAction);
		
		await getClient().execute(removeLineItemReq)
		.then(result => {
			setCartData(result.body);
			setOrderTotal(result.body.taxedPrice.totalGross.centAmount);
			setCurrencyCode(result.body.totalPrice.currencyCode);
			setCartVersion(result.body.version);
			setCartId(result.body.id);
			setCartItemsCount(findCartItemsCount(result.body));
			setGiftMsg(result.body.custom.fields.giftMessage.en);
			console.log('result from CommerceTools: ', result);
		})
		.catch(function(e) {
			setError(true);
			setErrorMessage(e.message);	
		});
	};

	const addGiftMsg = async (e) => {
		setGiftMsg(e.currentTarget.value);
	};

	const addCouponCode = async (e) => {
		setCouponCode(e.currentTarget.value);
	};

	const submitGiftMsg = async (e) => {
		console.log('Input giftMsg : ', giftMsg);

		const cartReqUri= reqBuilder.myCarts.byId(cartId).build();

		const addGiftMsgReqBody = {};
		addGiftMsgReqBody['version'] = cartVersion;
		
		//create action for the setCustomType
		var setCustomTypeObj = {};
		setCustomTypeObj['key'] = "giftMsgType";
		setCustomTypeObj['typeId'] = "type";

		var setCustomTypeAction = {};
		setCustomTypeAction['action'] = 'setCustomType';
		setCustomTypeAction['type'] = setCustomTypeObj;

		//create action for the setCustomField
		var setCustomFieldVal = {};
		setCustomFieldVal['en'] = giftMsg;

		var setCustomFieldAction = {};
		setCustomFieldAction['action'] = 'setCustomField';
		setCustomFieldAction['name'] = 'giftMessage';
		setCustomFieldAction['value'] = setCustomFieldVal;

		const actions = [setCustomTypeAction, setCustomFieldAction];
		addGiftMsgReqBody['actions'] = actions;
		
		
		let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;
		const addGiftMsgReq = {
			uri: cartReqUri,
			method: 'POST',
			body: addGiftMsgReqBody,
			headers: {
				'Authorization': 'Bearer '+bearerToken
			}
		};
		console.log('cartReqUri : ', cartReqUri);
		console.log('addGiftMsgActions : ', actions);
		
		await getClient().execute(addGiftMsgReq)
		.then(result => {
			setCartData(result.body);
			setOrderTotal(result.body.taxedPrice.totalGross.centAmount);
			setCurrencyCode(result.body.totalPrice.currencyCode);
			setCartVersion(result.body.version);
			setCartId(result.body.id);
			setCartItemsCount(findCartItemsCount(result.body));
			setGiftMsg(result.body.custom.fields.giftMessage.en);
			console.log('result from CommerceTools: ', result);
			if(document.getElementById('giftMsgBtn')){
				//console.log('giftMsgBtn...', document.getElementById('giftMsgBtn'));
				var content = document.getElementById('giftMsgBtn').nextElementSibling;
				//console.log('content ::::::::::::::: ', content);
				content.style.maxHeight = null;
				if(giftMsg){
					document.getElementById('giftMsgBtn').innerHTML = 'Edit Gift Message';
				}				
			}
		})
		.catch(function(e) {
			setError(true);
			setErrorMessage(e.message);	
		});
	};

	const addDiscountCode = async(value) =>  {		
			
			console.log('couponCode', couponCode);
			
			if(couponCode) {

				const addDiscountReqUri= reqBuilder.myCarts.byId(cartId).expand('discountCodes[*].discountCode').build();

				const addDiscountCodeBody= {};
				addDiscountCodeBody	["version"] = cartVersion;

				const addDiscountCodeAction = {};
				addDiscountCodeAction["action"] = 'addDiscountCode';
				addDiscountCodeAction["code"] = couponCode;

				addDiscountCodeBody["actions"] = [addDiscountCodeAction];

				console.log(addDiscountCodeBody);
				let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;

				const addDiscountItemReq = {
					uri: addDiscountReqUri,
					method: 'POST',
					body: addDiscountCodeBody,
					headers: {
						'Authorization': 'Bearer '+bearerToken
					}
				};
				console.log('AddDiscountReqUri', addDiscountItemReq);
				
				await getClient().execute(addDiscountItemReq)
				.then(result => {
					setCartData(result.body);
					setOrderTotal(result.body.taxedPrice.totalGross.centAmount);
					setCurrencyCode(result.body.totalPrice.currencyCode);
					setCartVersion(result.body.version);
					setCartId(result.body.id);
					setCartItemsCount(findCartItemsCount(result.body));
					console.log('result from CommerceTools for Remove Discount: ', result);
					
					if (result.body.discountCodes) {
						if(result.body.discountCodes.length > 0) {
							setCouponApplied('true');     
							setCouponCode(result.body.discountCodes[0].discountCode.obj.code);
							setCouponId(result.body.discountCodes[0].discountCode.id);	 
							setCouponDesc(result.body.discountCodes[0].discountCode.obj.description.en);
							document.getElementById("couponSuccessMsg").innerHTML = 'Coupon Applied Successfully';
						} else {
							setCouponApplied('false'); 
							setCouponCode('');	
							setCouponId('');
							setCouponDesc('');
							document.getElementById("couponSuccessMsg").innerHTML = '';
						}
					}
				})
				.catch(function(e) {
					setError(true);
					setErrorMessage(e.message);	
				});


			}else {
				console.log("Please Enter Valid Promo Code");
			}
		
			return true;
	};

	const removeDiscountCode = async() => {
		const removeDiscountReqUri= reqBuilder.myCarts.byId(cartId).expand('discountCodes[*].discountCode').build();
		const removeDiscountCodeBody= {};
				
				
				const removeDiscountCodeAction = {};
				removeDiscountCodeAction["action"] = 'removeDiscountCode';


				const removeDiscountCodeObj = {};
				removeDiscountCodeObj["typeId"] = "discount-code";
				removeDiscountCodeObj["id"] = couponId;

				removeDiscountCodeAction["discountCode"] = removeDiscountCodeObj;

				removeDiscountCodeBody["version"] = cartVersion;

				removeDiscountCodeBody["actions"] = [removeDiscountCodeAction];

				console.log(removeDiscountCodeBody);
				let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;
				const removeDiscountItemReq = {
					uri: removeDiscountReqUri,
					method: 'POST',
					body: removeDiscountCodeBody,
					headers: {
						'Authorization': 'Bearer '+bearerToken
					}
				};
				console.log('RemoveDiscountReqUri', removeDiscountItemReq);
				
				await getClient().execute(removeDiscountItemReq)
				.then(result => {
					setCartData(result.body);
					setOrderTotal(result.body.taxedPrice.totalGross.centAmount);
					setCurrencyCode(result.body.totalPrice.currencyCode);
					setCartVersion(result.body.version);
					setCartId(result.body.id);
					setCartItemsCount(findCartItemsCount(result.body));
					console.log('result from CommerceTools for Add Discount: ', result);

					if (result.body.discountCodes) {
						if(result.body.discountCodes.length > 0) {
							setCouponApplied('true');    
							setCouponCode(result.body.discountCodes[0].discountCode.obj.code);	
							setCouponId(result.body.discountCodes[0].discountCode.id);  
							setCouponDesc(result.body.discountCodes[0].discountCode.obj.description.en);      
						} else {
							setCouponApplied('false'); 
							setCouponCode('');	
							setCouponId('');
							setCouponDesc('');
							document.getElementById("couponSuccessMsg").innerHTML = 'Coupon Removed Successfully';
						}
					}
				})
				.catch(function(e) {
					setError(true);
					setErrorMessage(e.message);	
				});


			}

	return (
		<React.Fragment>
			<main className="cart">
			
				<header>
					<h1>Shopping Bag ({cartItemsCount})</h1>
					<dl>
						<dt>Subtotal</dt>
						<dd>{formatterService.formatCurrency(orderTotal, currencyCode)}</dd>						
					</dl>
				</header>
				<section>
					{!props.loggedIn ? (
						<p className="banner">
							Free Shipping and returns for members. <Link to="/login">Sign In</Link>
						</p>
					) : null}
					<table>
						<thead />
						<tbody>
						{cartData.lineItems && 
							cartData.lineItems.map((item, index) => (
							<tr key={item.id}  id={index}>
								<td className="cart-image">
									<img src={item.variant.images[0].url} alt={item.name.en} />									
								</td>	
								<td className="cart-image-info">
									<dl>
										<dt className="screen-reader">{item.name.en}</dt>
										<dd>
											<Link to="/cart">{item.name.en}</Link>
										</dd>
										<dt>Item no&#58;</dt>
										<dd>{item.productId}</dd>
										<dt>Color&#58;</dt>
										<dd>{item.variant.attributes.filter(obj => obj.name === 'color')[0].value.label.en}</dd>
										<dt className="screen-reader">Price</dt>
										<dd>
											{formatterService.formatCurrency(item.price.value.centAmount, currencyCode)}										</dd>
									</dl>
								</td>
								<td className="quantity">
									<p>{formatterService.formatCurrency(item.totalPrice.centAmount, currencyCode)}</p>
									<select defaultValue={item.quantity} onChange={updateItemQtyCart} id={item.id}>{renderQuantity(item.quantity)}</select>
									<ul>
										{/* <li>
											<a href="#">Edit</a>
										</li> */}
										<li>
											<a href="#">Save For Later</a>
										</li>
										<li>
											<div onClick={removeItemFromCart} id={item.id}><a href="javascript: {}">Remove</a></div>
										</li>
									</ul>
								</td>					
							</tr>
					))}
					</tbody>
					</table>
				</section>
				<aside>
					<h2>Cart Summary</h2>
					<table>
						<tbody>
						{cartData.taxedPrice &&						
						Object.keys(cartData.taxedPrice).filter(key => {
							return key === 'totalNet';
						}).map( key => (						
							<tr key={key.toString()}>
								<td>Subtotal</td>
								{ cartData.shippingInfo ? 
									<td>{formatterService.formatCurrency((cartData.taxedPrice['totalNet'].centAmount -cartData.shippingInfo.price.centAmount), currencyCode)}</td>
									:
									<td>{formatterService.formatCurrency(cartData.taxedPrice['totalNet'].centAmount, currencyCode)}</td>
								}															
							</tr>						
						))}	
						{couponDesc &&
							<tr>
								<td>
								<font size="2" color="red">Coupon Applied : </font>
								</td>
								<td>
									<i><font size="2" color="red">{couponDesc}</font></i>
								</td>
							</tr>	
						}						
						<tr>
							<td>
								<abbr title="Estimated">Est.</abbr> Shipping
							</td>							
							{ cartData.shippingInfo ? 
								<td>{formatterService.formatCurrency(cartData.shippingInfo.price.centAmount, currencyCode)}</td>
								:
								<td className="free">Free</td>
							}
						</tr>
						{cartData.taxedPrice &&	cartData.taxedPrice.taxPortions.length > 0 &&					
						Object.keys(cartData.taxedPrice).filter(key => {
							return key === 'taxPortions';
						}).map( key => (
							<tr>
								<td>
									<abbr title="Estimated">Est.</abbr> Taxes
								</td>
								<td>
									<abbr title="To Be Decided">{formatterService.formatCurrency(cartData.taxedPrice['taxPortions'][0].amount.centAmount, currencyCode)}</abbr>
								</td>
							</tr>
						))}
						{cartData.taxedPrice &&					
						Object.keys(cartData.taxedPrice).filter(key => {
							return key === 'totalGross';
						}).map( key => (
							<tr>
								<td>Total</td>
								<td>{formatterService.formatCurrency(cartData.taxedPrice['totalGross'].centAmount, currencyCode)}</td>
							</tr>
						))}	
						</tbody>
						<tfoot>
							<tr>
								<td colSpan="2">
								{cartData.lineItems && cartData.lineItems.length > 0 ?
									<LinkedButton to="/checkout/shipping">Checkout</LinkedButton>
								:
									<LinkedButton disabled to="/checkout/shipping">Checkout</LinkedButton>
								}
								</td>
							</tr>
							<tr>
								<td colSpan="2">
									<button type="button">PayPal</button>
								</td>
							</tr>
						</tfoot>
					</table>

					<p className="secure">Checkout quickly and securely</p>
					{ giftMsg &&
						<button id="giftMsgBtn" className="collapsible" onClick={toggleActive}>Edit Gift Message</button>
					}

					{ !giftMsg &&
						<button id="giftMsgBtn" className="collapsible" onClick={toggleActive}>Add a Gift Message</button>
					}

					<div className="content">					
						<table>
							<tbody>
							<tr>
								<td>
									<input 
										type="text" 
										name="giftMsgBox" 
										placeholder="Drop in a message....250 characters max" 
										value={giftMsg}
										onChange={addGiftMsg}

									/>								
								</td>
							</tr>
							<tr>
								<td>

								<button value="Submit" onClick={submitGiftMsg}>SUBMIT</button>

								</td>
							</tr>
							</tbody>						
						</table>
						<p>
							<small>Orders featuring custom-only products are not eligible for gift messaging.</small>
						</p>
					</div>

					<button className="collapsible" onClick={toggleActive}>Add Promo Code</button>
					<div className="content">
						<table>
							<tbody>
								<tr>
									<td>
										<input 
											type="text" 
											id="field1"
											name="promoCodeBox" 
											placeholder="Enter Promo Code" 
											value={couponCode}
											onChange={addCouponCode}
										/>								
									</td>
								</tr>
								<tr>
									<td>
									{ couponApplied == 'false' &&
									<button onClick={addDiscountCode}>APPLY</button>
									}
									{ couponApplied == 'true' &&
										<button onClick={removeDiscountCode}>REMOVE</button>
									}
									</td>
								</tr>							
							</tbody>					
						</table>
						<p>
							<span id="couponSuccessMsg"></span>
						</p>
						<p>
							<small>Students and members of the Military save 10% on every order</small>
						</p>
						<p>
							<small>
								See if you're eligible for <u>Student</u> or <u>Military</u> Discounts
							</small>
						</p>
					</div>
				</aside>
				<section className="you-may-also-like">
					<h1>You May Also Like</h1>
					<figure>
						<img src="/assets/img/best-seller-image.PNG" alt="Best Seller Image 1" />
						<figcaption>
							<a href="#"> Cowl Neck Tweed Pullover</a>
							<p>
								<del>&#36;159.00</del> &#8208; &#36;110.99
							</p>
						</figcaption>
					</figure>
					<figure>
						<img src="/assets/img/best-seller-image.PNG" alt="Best Seller Image 2" />
						<figcaption>
							<a href="#"> Scoop Neck Knit Top</a>
							<p>
								<del>&#36;159.00</del> &#8208; &#36;110.99
							</p>
						</figcaption>
					</figure>
					<figure>
						<img src="/assets/img/best-seller-image.PNG" alt="Best Seller Image 3" />
						<figcaption>
							<a href="#"> Scoop Neck Knit Top</a>
							<p>
								<del>&#36;159.00</del> &#8208; &#36;110.99
							</p>
						</figcaption>
					</figure>
					<figure>
						<img src="/assets/img/best-seller-image.PNG" alt="Best Seller Image 4" />
						<figcaption>
							<a href="#"> Long Sleeve Raglan Button</a>
							<p>
								<del>&#36;159.00</del> &#8208; &#36;110.99
							</p>
						</figcaption>
					</figure>
				</section>
			</main>
		</React.Fragment>
	);
};

export default Cart;
