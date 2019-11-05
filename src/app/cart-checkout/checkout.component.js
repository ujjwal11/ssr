import React, { useEffect, useState } from 'react';

import ErrorBoundary from 'react-error-boundary';
import loadable from '@loadable/component';

import Loader from '../common/loader.component';
import './checkout.scss';
import { formatterService } from '../common/formatter.service';
import CONSTANTS from '../../constants/constants';
import {getClient} from '../ct/client.js';
const projectKey = CONSTANTS[0].CT_PROJECT_KEY;

// Loadable components
// const Header = loadable(() => import(/* webpackChunkName: "home" */ '../global/header/header.component'), {
// 	fallback: (
// 		<ErrorBoundary>
// 			<Loader />
// 		</ErrorBoundary>
// 	)
// });

const Checkout = props => {
	console.log('checkout props: ', props);

	const [cartData, setCartData] = useState({});
	const [orderTotal, setOrderTotal] = useState(0);
	const [currencyCode, setCurrencyCode] = useState('EUR');
	const [error, setError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);
	const [cartVersion, setCartVersion] = useState(0);
	const [cartId, setCartId] = useState(0);
	const [cartItemsCount, setCartItemsCount] = useState(0);
	const [cartShippingAddress, setCartShippingAddress] = useState({});
	const [cartPayment, setCartPayment] = useState({});
	const [cartEmail, setCartEmail] = useState('');
	const [cartPhone, setCartPhone] = useState('');

	const [billingAddresses, setBillingAddresses] = useState([]);
	const [cartBillingAddress, setCartBillingAddress] = useState({});

	const [shippingMethods, setShippingMethods] = useState([]);
	const [shippingMethodIdselected, setShippingMethodIdselected] = useState('');

	const [orderId, setOrderId] = useState(null);

	const { createRequestBuilder } = require('@commercetools/api-request-builder');
	
	const reqBuilder = createRequestBuilder({projectKey});

	let unmounted = false;
	useEffect(() => {
		
		fetchCartFromCt(unmounted);		
		getShippingMethods(unmounted);
		if(props.loggedIn){
			fetchCustomerBillingAddresses(unmounted);
		}
				
		return function() {
			unmounted = true;
		};		
	}, [error, errorMessage]);

	const fetchCartFromCt = async (unmounted) => {
		
		//const cartReqUri= reqBuilder.carts.byCustomerId('e092703b-5199-43d1-b7dd-d96cf2694613').expand('discountCodes[*].discountCode').expand('paymentInfo.payments[*]').build();
		let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;
		console.log('reqBuilder', reqBuilder);

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
				console.log('result from CommerceTools: ', result);
				let activeCart = null;
				var activeCarts = result.body.results.filter(cart => cart.cartState === 'Active');
				var orderedCarts = result.body.results.filter(cart => cart.cartState === 'Ordered');
				if(props.checkoutPath != 'confirmation' && activeCarts.length > 0){
					//TODO Pick the current Cart
					activeCart = activeCarts[0];
				} else if(props.checkoutPath === 'confirmation' && orderedCarts.length > 0){	
					//TODO Pick the last ordered Cart				
					activeCart = orderedCarts[0];
				} else {
					//TODO Create Cart API
				}
				setCartData(activeCart);
				setOrderTotal(activeCart.taxedPrice.totalGross.centAmount);
				setCurrencyCode(activeCart.totalPrice.currencyCode);
				setCartVersion(activeCart.version);
				setCartId(activeCart.id);

				setCartItemsCount(findCartItemsCount(activeCart));	
				setCartShippingAddress(fetchAddress(activeCart.shippingAddress));
				setCartBillingAddress(fetchAddress(activeCart.billingAddress));
				setCartPayment(fetchPaymentDetails(activeCart.paymentInfo));
				console.log('Cart Shipping Method Id ', activeCart.shippingInfo);

				if(activeCart.shippingInfo && activeCart.shippingInfo.shippingMethod.id){
					setShippingMethodIdselected(activeCart.shippingInfo.shippingMethod.id);
				}
				console.log('checkout : result from CommerceTools: ', result);
				console.log('props.checkoutPath',props.checkoutPath);
				console.log('activeCart',activeCart);
				if(props.checkoutPath === 'shipping' || props.checkoutPath ===  'payment' || props.checkoutPath === 'review'){
					if( activeCart && activeCart.lineItems && activeCart.lineItems.length === 0){
						console.log('redirecting to cart page.', activeCart.lineItems.length);
						window.location.href = '/cart'; //relative to domain
					}
				} 
				if (props.checkoutPath ===  'payment' || props.checkoutPath === 'review') {
					if(!activeCart.shippingAddress || !activeCart.shippingAddress.firstName){
						console.log('redirecting to shipping page.');
						window.location.href = '/checkout/shipping'; //relative to domain
					}
				} 
				if (props.checkoutPath === 'review') {
					console.log('activeCart.billingAddress.firstName', activeCart.billingAddress);
					if(!activeCart.billingAddress || !activeCart.billingAddress.firstName){
						console.log('redirecting to payment page.');
						window.location.href = '/checkout/payment'; //relative to domain
					}
				}
			}

		})
		.catch(function(e) {console.log('ERROR', e);
			if (!unmounted) {
				setError(true);
				setErrorMessage(e.message);					
			}
		});
	};

	//Fetch All Shipping Methods
	const getShippingMethods = async (unmounted) => {
		let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;
        const shippingMethodeqUri = reqBuilder.shippingMethods.build()
        const getShippingMethodReq = {
                uri: shippingMethodeqUri,
				method:'GET',
				headers: {
					'Authorization': 'Bearer '+bearerToken
				}
        }
        await getClient().execute(getShippingMethodReq)
                .then(result => {
                    if(!unmounted) {
                        console.log("Shipping methods from CT",result);
                        setShippingMethods(result.body.results);
                        console.log("shipping result ==========", shippingMethods);
                        }
                }
                )
                .catch(function(e) {
                    if (!unmounted) {
                        setError(true);
                        setErrorMessage(e.message);                 
                    }
                });

    };

	const selectShippingMethod = async (e) => {
        setShippingMethodIdselected(e.currentTarget.value);

        console.log('cartShippingMethod selected  : ', e.currentTarget.value);
    }

	const fetchCustomerBillingAddresses = async (unmounted) => {
		//console.log('reqBuilder', reqBuilder);
		//const customerReqUri= reqBuilder.customers.byId('e092703b-5199-43d1-b7dd-d96cf2694613').build();
		const customerReqUri = '/'+projectKey+'/me'
		let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;

		const getCustmerRequest = {
			uri: customerReqUri,
			method:'GET',
			headers: {
				'Authorization': 'Bearer '+bearerToken
			}
		};
		await getClient().execute(getCustmerRequest)
			.then(result => {
			if (!unmounted) {
				console.log('result from getCustmerRequest: ', result);
				var customerBillingAddress = [];
				const customerAddresses = result.body.addresses;
				result.body.billingAddressIds.map((addressId) => {
					console.log('billingAddressId : ', addressId);
					console.log('customerAddresses : ', customerAddresses);
					customerBillingAddress.push(fetchAddress(customerAddresses.filter(address => address.id === addressId)[0]));									
				});

				console.log('customerBillingAddress', customerBillingAddress);

				setBillingAddresses(customerBillingAddress);					
			}

		})
		.catch(function(e) {
			if (!unmounted) {
				setError(true);
				setErrorMessage(e.message);					
			}
		});
	};


	const submitShippingDetails = async (e) => {
		e.preventDefault();
		console.log('Input cartShippingAddress : ', cartShippingAddress);
		/*
		var shippingInputElements = document.getElementById('shippingForm').getElementsByTagName("input");
		for (var i = 0; i < shippingInputElements.length; i++) {
			if(shippingInputElements[i].value == "") {
				shippingInputElements[i].focus();
				return false;
			}
		}
		*/

		const cartReqUri= reqBuilder.myCarts.byId(cartId).build();

		const setShippingAddrReqBody = {};
		setShippingAddrReqBody['version'] = cartVersion;
		

		var shippingMethod={};
		console.log('submitShippingDetails() : shippingMethodIdselected : ', shippingMethodIdselected);
        shippingMethod['id'] = shippingMethodIdselected;
		shippingMethod['typeId'] = "shipping-method";
		
		var setShippingMethodAction = {};
        setShippingMethodAction['action'] = 'setShippingMethod';        
        setShippingMethodAction['shippingMethod']= shippingMethod;

		
		var setShippingAddrAction = {};
		setShippingAddrAction['action'] = 'setShippingAddress';
		setShippingAddrAction['address'] = cartShippingAddress;

		const actions = [setShippingAddrAction, setShippingMethodAction];
		setShippingAddrReqBody['actions'] = actions;
		
		
		let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;

		const setShippingAddrReq = {
			uri: cartReqUri,
			method: 'POST',
			body: setShippingAddrReqBody,
			headers: {
				'Authorization': 'Bearer '+bearerToken
			}
		};
		console.log('cartReqUri : ', cartReqUri);
		console.log('setShippingAddrAction : ', actions);
		
		await getClient().execute(setShippingAddrReq)
		.then(result => {
			setCartData(result.body);
			setOrderTotal(result.body.taxedPrice.totalGross.centAmount);
			setCurrencyCode(result.body.totalPrice.currencyCode);
			setCartVersion(result.body.version);
			setCartId(result.body.id);
			setCartItemsCount(findCartItemsCount(result.body));	
			setCartShippingAddress(fetchAddress(result.body.shippingAddress));
			console.log('checkout-shipping : result from CommerceTools: ', result);				
			console.log('Result cartShippingAddress : ', cartShippingAddress);
			
			window.location.href = '/checkout/payment'; //relative to domain
		})
		.catch(function(e) {
			setError(true);
			setErrorMessage(e.message);	
		});

		return true;
	};
	
	const addPaymentToCart = async (paymentId) => {
		
		console.log('Input addPaymentToCart : ', paymentId);
		
		const cartReqUri= reqBuilder.myCarts.byId(cartId).build();
		console.log('cartReqUri : ', cartReqUri);

		const addPaymentToCartReqBody = {};
		addPaymentToCartReqBody['version'] = cartVersion;
		
		var removePaymentFromCartActions = [];
		if( cartData.paymentInfo && cartData.paymentInfo.payments){

			cartData.paymentInfo.payments.map((item) => {
				console.log('payment id ::: ', item.id);

				//create action for the removePaymentFromCart
				var paymentObj = {};
				paymentObj['id'] = item.id;
				paymentObj['typeId'] = 'payment';		
				
				var removePaymentFromCartAction = {};
				removePaymentFromCartAction['action'] = 'removePayment';
				removePaymentFromCartAction['payment'] = paymentObj;

				removePaymentFromCartActions.push(removePaymentFromCartAction);
			});
			
			console.log('removePaymentFromCartActions ', removePaymentFromCartActions);
		}

		//create action for the addPaymentToCart
		var paymentObj = {};
		paymentObj['id'] = paymentId;
		paymentObj['typeId'] = 'payment';	
		
		var addPaymentToCartAction = {};
		addPaymentToCartAction['action'] = 'addPayment';		
		addPaymentToCartAction['payment'] = paymentObj;

		const addBillingAddressToCartAction = createAddBillingAddressToCartAction();
		console.log('addBillingAddressToCartAction', addBillingAddressToCartAction);

		const actions = [...removePaymentFromCartActions, addPaymentToCartAction];
		if(addBillingAddressToCartAction){
			actions.push(addBillingAddressToCartAction);
		}
		console.log('addPaymentToCartActions : ', actions);

		addPaymentToCartReqBody['actions'] = actions;
		
		
		let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;
		const addPaymentToCartReq = {
			uri: cartReqUri,
			method: 'POST',
			body: addPaymentToCartReqBody,
			headers: {
				'Authorization': 'Bearer '+bearerToken
			}
		};
		
		
		await getClient().execute(addPaymentToCartReq)
		.then(result => {				
			console.log('checkout-payment addPaymentToCartReq : result from CommerceTools: ', result);		
			setCartData(result.body);
			setOrderTotal(result.body.taxedPrice.totalGross.centAmount);
			setCurrencyCode(result.body.totalPrice.currencyCode);
			setCartVersion(result.body.version);
			setCartId(result.body.id);
			setCartItemsCount(findCartItemsCount(result.body));	
			setCartShippingAddress(fetchAddress(result.body.shippingAddress));
			setCartBillingAddress(fetchAddress(result.body.billingAddress));		
			//TODO Fetch CC details and update cartPayment state	
			
			window.location.href = '/checkout/review'; //relative to domain
		})
		.catch(function(e) {
			setError(true);
			setErrorMessage(e.message);	
		});
	};

	
	const createAddBillingAddressToCartAction = () => {
		
		console.log('createAddBillingAddressToCartAction CartBillingAddress ', cartBillingAddress);
			
		//create action for the addBillingAddressToCart
		var addBillingAddressToCartAction = null;
		const isEmptyCartBillingAddress = Object.keys(cartBillingAddress).length === 0 && cartBillingAddress.constructor === Object
		console.log('IS EMPTY cartBillingAddress :::', isEmptyCartBillingAddress);
		if(!isEmptyCartBillingAddress){
			addBillingAddressToCartAction = {};
			addBillingAddressToCartAction['action'] = 'setBillingAddress';
			console.log('cartBillingAddress ', cartBillingAddress);
			addBillingAddressToCartAction['address'] = cartBillingAddress;
		}
		return addBillingAddressToCartAction;		
	};

	const submitPaymentDetails = async (e) => {	
		e.preventDefault();
		/*
		if(document.getElementById('billingForm')){
			var billingInputElements = document.getElementById('billingForm').getElementsByTagName("input");
			for (var i = 0; i < billingInputElements.length; i++) {
				if(billingInputElements[i].value == "") {
					billingInputElements[i].focus();
					return false;
				}
			}
		} else if (document.getElementById('savedBillingAddress').value == "") {			
			document.getElementById('savedBillingAddress').focus();	
			return false;
		}
		

		const CCFields = ['cardNumber', 'expMonth', 'expYear', 'securityCode'];
		for( var i = 0; i < CCFields.length; i++){
			if(document.getElementsByName(CCFields[i])[0].value == ''){
				document.getElementsByName(CCFields[i])[0].focus();
				return false;
			}
		}
		*/
		console.log('Input cartPayment : ', cartPayment);
		
		
		//const paymentReqUri= reqBuilder.payments.build();
		const paymentReqUri= '/'+projectKey+'/me/payments';
		console.log('paymentReqUri : ', paymentReqUri);
		
		const createPaymentReqBody = {};
		
		//create amountPlanned
		
		var amountPlanned = {};
		amountPlanned['currencyCode'] = currencyCode;
		amountPlanned['centAmount'] = orderTotal;

		//create paymentMethodInfo
		var paymentMethodInfo = {};
		paymentMethodInfo['method'] = 'Credit Card';
		var paymentLocalizedString = {};
		paymentLocalizedString['en'] = 'Credit Card';
		paymentLocalizedString['de'] = 'Credit Card';
		paymentMethodInfo['name'] = paymentLocalizedString;
	
		createPaymentReqBody['amountPlanned'] = amountPlanned;
		createPaymentReqBody['paymentMethodInfo'] = paymentMethodInfo;
		createPaymentReqBody['custom'] = getCustomFieldsForPayment();
		
		let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;
		const createPaymentReq = {
			uri: paymentReqUri,
			method: 'POST',
			body: createPaymentReqBody,
			headers: {
				'Authorization': 'Bearer '+bearerToken
			}
		};
		
		console.log('createPaymentReqBody : ', createPaymentReqBody);
		
		await getClient().execute(createPaymentReq)
		.then(result => {			
			console.log('createPaymentReq : result from CommerceTools: ', result);				
			addPaymentToCart(result.body.id);			
		})
		.catch(function(e) {
			setError(true);
			setErrorMessage(e.message);	
		});		

		return true;
	};


	const createOrderFromCart = async (e) => {
		e.preventDefault();
		console.log('Create Order from cart Id : ', cartId);
		
		const createOrderReqUri= reqBuilder.myOrders.build();

		const createOrderReqReqBody = {};
		createOrderReqReqBody['id'] = cartId;
		createOrderReqReqBody['version'] = cartVersion;
				
		let bearerToken = JSON.parse(localStorage.getItem('user_token')).access_token;

		const createOrderRequest = {
			uri: createOrderReqUri,
			method: 'POST',
			body: createOrderReqReqBody,
			headers: {
				'Authorization': 'Bearer '+bearerToken
			}
		};
		console.log('createOrderRequest URI : ', createOrderReqUri);
		console.log('createOrderReqReqBody  : ', createOrderReqReqBody);
		
		await getClient().execute(createOrderRequest)
		.then(result => {
			setOrderId(result.body.id);
			
			console.log('createOrderFromCart : result from CommerceTools: ', result);				
			console.log('createOrderFromCart created order id : ', orderId);
			
			window.location.href = '/checkout/confirmation'; //relative to domain
			//TODO create Empty Cart 
		})
		.catch(function(e) {
			setError(true);
			setErrorMessage(e.message);	
		});

		return true;
	};

	const getCustomFieldsForPayment = () => {		

		console.log('getCustomFieldsForPayment() : Input cartPayment : ', cartPayment);

		//type		
		var objCCPaymentType = {};
		objCCPaymentType['typeId'] = 'type';
		objCCPaymentType['key'] = 'ccPaymentType';
		//fields
		var ccPaymentTypeFields = {};
		ccPaymentTypeFields['cardNumber'] = btoa(cartPayment.cardNumber);//Base 64 Encoding
		ccPaymentTypeFields['cardExpMonth'] = cartPayment.cardExpMonth;
		ccPaymentTypeFields['cardExpYear'] = cartPayment.cardExpYear;
		//action
		var customTypeToPaymentAction = {};
		customTypeToPaymentAction['type'] = objCCPaymentType;
		customTypeToPaymentAction['fields'] = ccPaymentTypeFields;
		
		console.log('customTypeToPaymentAction : ', customTypeToPaymentAction);
		
		return customTypeToPaymentAction;	
	};
	
	const findCartItemsCount = response => {
		var totalQty = 0;
		if(response.lineItems) { 
			let result = response.lineItems.map(a => a.quantity);
			totalQty = totalQty + result.reduce((a, b) => a + b, 0);
		}

		return totalQty;
	};

	const fetchAddress = address => {
		var addressObj = {};
		if(address){
			addressObj.id = address.id;
			addressObj.firstName = address.firstName;
			addressObj.lastName = address.lastName;
			addressObj.country = address.country;
			addressObj.state = address.state;
			addressObj.city = address.city;
			addressObj.postalCode = address.postalCode;
			addressObj.phone = address.phone;
		}

		return addressObj;
	}

	const fetchPaymentDetails = paymentInfo => {
		var cartPayment = {};
		if(paymentInfo && paymentInfo.payments[0]){
			console.log('paymentInfo : ', paymentInfo.payments[0]);

			if(paymentInfo.payments[0].obj.custom 
				&& paymentInfo.payments[0].obj.custom.fields) {

				cartPayment['cardNumber'] = atob(paymentInfo.payments[0].obj.custom.fields.cardNumber);
				cartPayment['cardExpMonth'] = paymentInfo.payments[0].obj.custom.fields.cardExpMonth;
				cartPayment['cardExpYear'] = paymentInfo.payments[0].obj.custom.fields.cardExpYear;
			}
			
		}
		console.log('fetchPaymentDetails retuerns : ', cartPayment);
		return cartPayment;
	}
	const updateAddress = async (e) => {
		
		cartShippingAddress[e.currentTarget.name] = e.currentTarget.value;
		console.log('cartShippingAddress : ',cartShippingAddress);
		setCartShippingAddress(fetchAddress(cartShippingAddress));		
	}

	const updateBillingAddress = async (e) => {
		cartBillingAddress[e.currentTarget.name] = e.currentTarget.value;
		console.log('cartBillingAddress : ',cartBillingAddress);		
		setCartBillingAddress(fetchAddress(cartBillingAddress));
	}
	

	const updateCartPayment = async (e) => {
		/*if('cardNumber' === e.currentTarget.name){
			cartPayment[e.currentTarget.name] = btoa(e.currentTarget.value);//Base64 Encode
		} else {
			cartPayment[e.currentTarget.name] = e.currentTarget.value;
		}*/
		cartPayment[e.currentTarget.name] = e.currentTarget.value;
		var newPayment = {};
		newPayment['cardNumber'] = cartPayment.cardNumber;
		newPayment['cardExpMonth'] = cartPayment.cardExpMonth;
		newPayment['cardExpYear'] = cartPayment.cardExpYear;
		
		setCartPayment(newPayment);
		console.log('cartPayment : ',cartPayment);
	}

	const updateCartBillingAddress = async (e) => {
		console.log('updateCartBillingAddress selectedBillingAddress : ', e.currentTarget.value);
		const selectedBillingAddress = billingAddresses.filter(address => address.id === e.currentTarget.value);
		console.log('selectedBillingAddress', selectedBillingAddress[0]);
		setCartBillingAddress(selectedBillingAddress[0]);		
	}

	const updateCartPhone = async (e) => {
		setCartPhone(e.currentTarget.value);
	}

	const updateCartEmail = async (e) => {
		setCartEmail(e.currentTarget.value);
	}

	return (		
		<React.Fragment>	
			<i>{errorMessage}</i>					
			{props.checkoutPath === 'shipping' ? (
				<main className="checkout">
					<section>
						<div className="shipping">
							<header>
								<h2>Shipping</h2>
							</header>
							<div>
								<form id="shippingForm" className="shipping-form" onSubmit={submitShippingDetails}>
								
									<fieldset>
										<div>
											<label htmlFor="firstName">*First Name</label>
											<input type="text" required name="firstName" value={cartShippingAddress.firstName} onChange={updateAddress} />
											
										</div>
										<div>
											<label htmlFor="lastName">*Last Name</label>
											<input type="text" required name="lastName" value={cartShippingAddress.lastName} onChange={updateAddress} />
										</div>
									</fieldset>									
																		
									<fieldset>
										<div>
											<label htmlFor="country">*Country</label>
											<input type="text" required name="country" placeholder="DE" value={cartShippingAddress.country} onChange={updateAddress} />
										</div>
										<div>
											<label htmlFor="state">*State</label>
											<select name="state" required id="state" value={cartShippingAddress.state} onChange={updateAddress} >
												<option value="">Select State</option>
												<option value="BE">Berlin</option>
												<option value="HH">Hamburg</option>
												<option value="HE">Hesse</option>
											</select>
										</div>
									</fieldset>
								
									<fieldset>
										<div>
											<label htmlFor="city">*City</label>
											<input type="text" required name="city" value={cartShippingAddress.city} onChange={updateAddress} />
										</div>
										<div>
											<label htmlFor="zipCode">*ZIP Code</label>
											<input type="text" pattern="[0-9]{6}" required name="postalCode" value={cartShippingAddress.postalCode} onChange={updateAddress} />
											<small>Example: 123456</small>
										</div>
									</fieldset>
								
									<fieldset>
										<label htmlFor="phoneNumber">*Phone Number</label>
										<input type="tel" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" required name="phone" value={cartShippingAddress.phone} onChange={updateAddress} />
										<small>Example: 987-654-3210</small>
									</fieldset>
								
								
									<fieldset className="shipping-methods">
										<legend htmlFor="shipMethod">Shipping Method</legend>
										{shippingMethods && shippingMethods.map((item, index) => (
                                        <div>
                                            <input type="radio" id={item.name} name="shipMethod" value={item.id} onClick={selectShippingMethod} checked={shippingMethodIdselected ? shippingMethodIdselected === item.id ? 'checked' : '' : index === 0 ? 'checked' : ''} />
                                            <label htmlFor={item.name}>{item.name}</label>
                                        </div>
                                        ))}
									</fieldset>
									<button type="submit" className="place-order">
										Continue to Payment
									</button>		
								</form>
							</div>
						</div>
						
					</section>
					<aside>
						<section>
							<header>
								<h2>Order Summary</h2>
							</header>
							<div className="order-summary">
								<ul className="dot-leader">
									{cartData.taxedPrice &&						
											Object.keys(cartData.taxedPrice).filter(key => {
												return key === 'totalNet';
											}).map( key => (
												<li>
													<span>Subtotal</span>		
													{ cartData.shippingInfo ? 
														<span>{formatterService.formatCurrency((cartData.taxedPrice['totalNet'].centAmount -cartData.shippingInfo.price.centAmount), currencyCode)}</span>
														:
														<span>{formatterService.formatCurrency(cartData.taxedPrice['totalNet'].centAmount, currencyCode)}</span>
													}												
												</li>
											))}
									
									<li>
										<span>Shipping</span>
									{ cartData.shippingInfo ? 
										<span>{formatterService.formatCurrency(cartData.shippingInfo.price.centAmount, currencyCode)}</span>
										:
										<span>TBD</span>
									}									
									</li>
									{cartData.taxedPrice &&	cartData.taxedPrice.taxPortions.length > 0 &&					
										Object.keys(cartData.taxedPrice).filter(key => {
											return key === 'taxPortions';
										}).map( key => (
											<li>
												<span>Sales Tax</span>
												<span>{formatterService.formatCurrency(cartData.taxedPrice['taxPortions'][0].amount.centAmount, currencyCode)}</span>
											</li>											
										))}
									
									
										{cartData.taxedPrice &&					
											Object.keys(cartData.taxedPrice).filter(key => {
												return key === 'totalGross';
											}).map( key => (
												<li>
													<span>Total</span>
													<span>{formatterService.formatCurrency(cartData.taxedPrice['totalGross'].centAmount, currencyCode)}</span>
												</li>
											))}	
									
								</ul>
							</div>
						</section>
						
						<section>
						
							<div className="cart-items">
								<ul className="item-total dot-leader">
																			
									<li>
										<span>{cartItemsCount} Items</span>
										<span>{formatterService.formatCurrency(orderTotal, currencyCode)}</span>
									</li>
									
								</ul>
								{cartData.lineItems && cartData.lineItems.map((item, index) => (
								<div className="item">
									<strong>Scoop Neck Knit Top</strong>
									<figure>
										<img src={item.variant.images[0].url} alt={item.name.en} height="97" width="97"/>
										<figcaption>
											<div>Item no: {item.productId}</div>
											<div>In Stock</div>
											<div>Color: {item.variant.attributes.filter(obj => obj.name === 'color')[0].value.label.en}</div>
											<div>
												{formatterService.formatCurrency(item.price.value.centAmount, currencyCode)}
											</div>
										</figcaption>
									</figure>
								</div>
								))}
							</div>
							
							<footer>
								<table>
									<thead>
										<tr>
											<th>Each</th>
											<th>Quantity</th>
											<th>Total</th>
										</tr>
									</thead>
									{cartData.lineItems && cartData.lineItems.map((item, index) => (
									<tbody>
										<tr>
											<td>{formatterService.formatCurrency(item.price.value.centAmount, currencyCode)}</td>
											<td>{item.quantity}</td>
											<td>{formatterService.formatCurrency(item.totalPrice.centAmount, currencyCode)}</td>
										</tr>
									</tbody>))}
								</table>
							</footer>
						</section>
						
					</aside>
				</main>
			) : props.checkoutPath === 'payment' ? (			
				<main className="checkout">
					<section>
						<div className="shipping">
							<header>
								<h2>Shipping</h2>
								<a href="/checkout/shipping">Edit</a>
							</header>
							<div className="saved-shipping-method">
								<h3>Shipping Address:</h3>
								{ cartShippingAddress &&
									<address>
										{cartShippingAddress.firstName} {cartShippingAddress.lastName} <br />
										{cartShippingAddress.country} <br />
										{cartShippingAddress.city}, {cartShippingAddress.state} - {cartShippingAddress.postalCode} <br />
										{cartShippingAddress.phone}
									</address>
								}
								<h3>Shipping Method:</h3>
									{ cartData.shippingInfo ? 
										<ul className="selected-shipping dot-leader">
											<li>
												<span>{cartData.shippingInfo.shippingMethodName}</span>
												<span>{formatterService.formatCurrency(cartData.shippingInfo.price.centAmount, currencyCode)}</span>
											</li>
										</ul>
									:
										<span>TBD</span>
									}								
							</div>
						</div>
						<div>
							<header>
								<h2>Payment</h2>
							</header>
							<form id="paymentForm" className="payment-form" onSubmit={submitPaymentDetails}>
								{ props.loggedIn && billingAddresses.length > 0 ?
									<fieldset>
										<label>Billing Address {cartBillingAddress.id}</label>									
										<select name="savedBillingAddress" id="savedBillingAddress" value={cartBillingAddress.id} onChange={updateCartBillingAddress}>
											<option value="">Select Address</option>
											{billingAddresses && billingAddresses.map((address, index) => (
												<option value={address.id}>
													{address.firstName} {address.lastName}, {address.city}, {address.state} - {address.postalCode}
												</option>
											))}
										</select>
									</fieldset>
								: 
								
								<billing-form>
									<h3>Billing Address:</h3>
									<fieldset>
										<div>
											<label htmlFor="firstName">*First Name</label>
											<input type="text" required name="firstName" value={cartBillingAddress.firstName} onChange={updateBillingAddress} />
										</div>
										<div>
											<label htmlFor="lastName">*Last Name</label>
											<input type="text" required name="lastName" value={cartBillingAddress.lastName} onChange={updateBillingAddress} />
										</div>
									</fieldset>									
																		
									<fieldset>
										<div>
											<label htmlFor="country">*Country</label>
											<input type="text" required name="country" placeholder="DE" value={cartBillingAddress.country} onChange={updateBillingAddress} />
										</div>
										<div>
											<label htmlFor="state">*State</label>
											<select name="state" required id="state" value={cartBillingAddress.state} onChange={updateBillingAddress} >
												<option value="">Select State</option>
												<option value="BE">Berlin</option>
												<option value="HH">Hamburg</option>
												<option value="HE">Hesse</option>
											</select>
										</div>
									</fieldset>
								
									<fieldset>
										<div>
											<label htmlFor="city">*City</label>
											<input type="text" required name="city" value={cartBillingAddress.city} onChange={updateBillingAddress} />
										</div>
										<div>
											<label htmlFor="zipCode">*ZIP Code</label>
											<input type="text" pattern="[0-9]{6}" required  name="postalCode" value={cartBillingAddress.postalCode} onChange={updateBillingAddress} />
											<small>Example: 123456</small>
										</div>
									</fieldset>
								
									<fieldset>
										<label htmlFor="phoneNumber">*Phone Number</label>
										<input type="text" name="phone" value={cartBillingAddress.phone} onChange={updateBillingAddress} />
										<small>Example: 987-654-3210</small>
									</fieldset>								
								</billing-form>
											
								}
								
								{ cartPayment &&
								<fieldset>
									<label htmlFor="cardNumber">*Card Number</label>
									<input type="text" maxLength="16" pattern="[0-9]{15,16}" required  name="cardNumber"  value={cartPayment.cardNumber} id="cardNumber" onChange={updateCartPayment}/>
								</fieldset>
								}
								{ cartPayment &&
								<fieldset>
									<div>
										<label htmlFor="expMonth">*Expiration Month</label>
										<select name="cardExpMonth" required id="expMonth" value={cartPayment.cardExpMonth} onChange={updateCartPayment}>
											<option value="">
												Month
											</option>
											<option value="Jan">Jan</option>
											<option value="Feb">Feb</option>
											<option value="Mar">Mar</option>
											<option value="Apr">Apr</option>
											<option value="May">May</option>
											<option value="Jun">Jun</option>
											<option value="Jul">Jul</option>
											<option value="Aug">Aug</option>
											<option value="Sep">Sep</option>
											<option value="Oct">Oct</option>
											<option value="Nov">Nov</option>
											<option value="Dec">Dec</option>
										</select>
									</div>
									<div>
										<label htmlFor="expYear">*Expiration Year</label>
										<select name="cardExpYear" required id="expYear" value={cartPayment.cardExpYear} onChange={updateCartPayment}>
											<option value="">
												Year
											</option>
											<option value="2019">2019</option>
											<option value="2020">2020</option>
											<option value="2021">2021</option>
											<option value="2022">2022</option>
											<option value="2023">2023</option>
											<option value="2024">2024</option>
											<option value="2025">2025</option>
										</select>
									</div>
								</fieldset>
								}
								{ cartPayment &&
								<fieldset>
									<label htmlFor="securityCode">*Security Code</label>
									<input type="text" type="text" pattern="[0-9]{3}" required name="securityCode" id="securityCode" value={cartPayment.securityCode} onChange={updateCartPayment} />
								</fieldset>
								}
								
								<fieldset>
									
									<div>
										<label htmlFor="email">*Email</label>
										<input type="email" name="email" id="email" value={cartEmail} onChange={updateCartEmail} />
									</div>
									
									<div>
										<label htmlFor="phoneNum">*Phone Number</label>
										<input type="text" type="tel" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" required  name="phoneNum" id="phoneNum" placeholder="303-568-6272" value={cartPhone} onChange={updateCartPhone} />
										<small>Example: 987-654-3210</small>
									</div>
									
								</fieldset>
								<button type="submit" className="place-order">
									Continue To Review Order
								</button>
							</form>
						</div>
						
					</section>
					<aside>
						<section>
							<header>
								<h2>Order Summary</h2>
							</header>
							<div className="order-summary">
								<ul className="dot-leader">
									{cartData.taxedPrice &&						
											Object.keys(cartData.taxedPrice).filter(key => {
												return key === 'totalNet';
											}).map( key => (
												<li>
													<span>Subtotal</span>						
													{ cartData.shippingInfo ? 
														<span>{formatterService.formatCurrency((cartData.taxedPrice['totalNet'].centAmount -cartData.shippingInfo.price.centAmount), currencyCode)}</span>
														:
														<span>{formatterService.formatCurrency(cartData.taxedPrice['totalNet'].centAmount, currencyCode)}</span>
													}
												</li>
										))}
										{ cartData.shippingInfo && cartData.shippingInfo.price &&
												<li>
													<span>Shipping</span>
													<span>{formatterService.formatCurrency(cartData.shippingInfo.price.centAmount, currencyCode)}</span>
												</li>
											}
									{cartData.taxedPrice &&	cartData.taxedPrice.taxPortions.length > 0 &&					
										Object.keys(cartData.taxedPrice).filter(key => {
											return key === 'taxPortions';
										}).map( key => (
											<li>
												<span>Sales Tax</span>
												<span>{formatterService.formatCurrency(cartData.taxedPrice['taxPortions'][0].amount.centAmount, currencyCode)}</span>
											</li>											
										))}
									
									
									{cartData.taxedPrice &&					
										Object.keys(cartData.taxedPrice).filter(key => {
												return key === 'totalGross';
										}).map( key => (
											<li>
												<span>Total</span>
												<span>{formatterService.formatCurrency(cartData.taxedPrice['totalGross'].centAmount, currencyCode)}</span>
											</li>
										))}	
									
								</ul>
							</div>
						</section>
						<section>
						
							<div className="cart-items">
								<ul className="item-total dot-leader">
																			
									<li>
										<span>{cartItemsCount} Items</span>
										<span>{formatterService.formatCurrency(orderTotal, currencyCode)}</span>
									</li>
									
								</ul>
								{cartData.lineItems && cartData.lineItems.map((item, index) => (
								<div className="item">
									<strong>Scoop Neck Knit Top</strong>
									<figure>
										<img src={item.variant.images[0].url} alt={item.name.en} height="97" width="97"/>
										<figcaption>
											<div>Item no: {item.productId}</div>
											<div>In Stock</div>
											<div>Color: {item.variant.attributes.filter(obj => obj.name === 'color')[0].value.label.en}</div>
											<div>
												{formatterService.formatCurrency(item.price.value.centAmount, currencyCode)}
											</div>
										</figcaption>
									</figure>
								</div>
								))}
							</div>
							
							<footer>
								<table>
									<thead>
										<tr>
											<th>Each</th>
											<th>Quantity</th>
											<th>Total</th>
										</tr>
									</thead>
									{cartData.lineItems && cartData.lineItems.map((item, index) => (
									<tbody>
										<tr>
											<td>{formatterService.formatCurrency(item.price.value.centAmount, currencyCode)}</td>
											<td>{item.quantity}</td>
											<td>{formatterService.formatCurrency(item.totalPrice.centAmount, currencyCode)}</td>
										</tr>
									</tbody>))}
								</table>
							</footer>
						</section>
						
					</aside>
				</main>
			) : (
				<main className="checkout">
					<section>
						<div className="shipping">
							<header>
								<h2>Shipping</h2>
								{ props.checkoutPath != 'confirmation' ? 
									<a href="/checkout/shipping">Edit</a>
									:
									<span></span>
								}
							</header>
							<div className="saved-shipping-method">
								<h3>Shipping Address:</h3>
								{ cartShippingAddress &&
									<address>
										{cartShippingAddress.firstName} {cartShippingAddress.lastName} <br />
										{cartShippingAddress.country} <br />
										{cartShippingAddress.city}, {cartShippingAddress.state} - {cartShippingAddress.postalCode} <br />
										{cartShippingAddress.phone}
									</address>
								}
								<h3>Shipping Method:</h3>
									{ cartData.shippingInfo ? 
										<ul className="selected-shipping dot-leader">
											<li>
												<span>{cartData.shippingInfo.shippingMethodName}</span>
												<span>{formatterService.formatCurrency(cartData.shippingInfo.price.centAmount, currencyCode)}</span>
											</li>
										</ul>
									:
										<span>TBD</span>
									}								
							</div>
						</div>
						<div>
							<header>
								<h2>Payment</h2>								
								{ props.checkoutPath != 'confirmation' ? 
									<a href="/checkout/payment">Edit</a>
									:
									<span></span>
								}
							</header>
							<div className="saved-shipping-method">
								<h3>Billing Address:</h3>
								{ cartBillingAddress &&
									<address>
										{cartBillingAddress.firstName} {cartBillingAddress.lastName} <br />
										{cartBillingAddress.country} <br />
										{cartBillingAddress.city}, {cartBillingAddress.state} - {cartBillingAddress.postalCode} <br />
										{cartBillingAddress.phone}
									</address>
								}
								<h3>Payment Method:</h3>
									{ cartPayment ? 
										<ul className="selected-shipping dot-leader">
											<li>
												<span>Credit Card Number</span>
												<span>{cartPayment.cardNumber}</span>
											</li>
											<li>
												<span>Credit Card Expiry Month</span>
												<span>{cartPayment.cardExpMonth}</span>
											</li>
											<li>
												<span>Credit Card Expiry Year</span>
												<span>{cartPayment.cardExpYear}</span>
											</li>
										</ul>
									:
										<span>TBD</span>
									}								
							</div>
							{ props.checkoutPath != 'confirmation' ? 
								<button type="submit" className="place-order" onClick={createOrderFromCart}>
									Order Submit
								</button>
								:
								<span></span>
							}
							
						</div>
					</section>
					<aside>
						<section>
							<header>
								<h2>Order Summary</h2>
							</header>
							<div className="order-summary">
								<ul className="dot-leader">
									{cartData.taxedPrice &&						
											Object.keys(cartData.taxedPrice).filter(key => {
												return key === 'totalNet';
											}).map( key => (
												<li>
													<span>Subtotal</span>						
													{ cartData.shippingInfo ? 
														<span>{formatterService.formatCurrency((cartData.taxedPrice['totalNet'].centAmount -cartData.shippingInfo.price.centAmount), currencyCode)}</span>
														:
														<span>{formatterService.formatCurrency(cartData.taxedPrice['totalNet'].centAmount, currencyCode)}</span>
													}
												</li>
										))}
										{ cartData.shippingInfo && cartData.shippingInfo.price &&
												<li>
													<span>Shipping</span>
													<span>{formatterService.formatCurrency(cartData.shippingInfo.price.centAmount, currencyCode)}</span>
												</li>
											}
									{cartData.taxedPrice &&	cartData.taxedPrice.taxPortions.length > 0 &&					
										Object.keys(cartData.taxedPrice).filter(key => {
											return key === 'taxPortions';
										}).map( key => (
											<li>
												<span>Sales Tax</span>
												<span>{formatterService.formatCurrency(cartData.taxedPrice['taxPortions'][0].amount.centAmount, currencyCode)}</span>
											</li>											
										))}
									
									
									{cartData.taxedPrice &&					
										Object.keys(cartData.taxedPrice).filter(key => {
												return key === 'totalGross';
										}).map( key => (
											<li>
												<span>Total</span>
												<span>{formatterService.formatCurrency(cartData.taxedPrice['totalGross'].centAmount, currencyCode)}</span>
											</li>
										))}	
									
								</ul>
							</div>
						</section>
						<section>
						
							<div className="cart-items">
								<ul className="item-total dot-leader">
																			
									<li>
										<span>{cartItemsCount} Items</span>
										<span>{formatterService.formatCurrency(orderTotal, currencyCode)}</span>
									</li>
									
								</ul>
								{cartData.lineItems && cartData.lineItems.map((item, index) => (
								<div className="item">
									<strong>Scoop Neck Knit Top</strong>
									<figure>
										<img src={item.variant.images[0].url} alt={item.name.en} height="97" width="97"/>
										<figcaption>
											<div>Item no: {item.productId}</div>
											<div>In Stock</div>
											<div>Color: {item.variant.attributes.filter(obj => obj.name === 'color')[0].value.label.en}</div>
											<div>
												{formatterService.formatCurrency(item.price.value.centAmount, currencyCode)}
											</div>
										</figcaption>
									</figure>
								</div>
								))}
							</div>
							
							<footer>
								<table>
									<thead>
										<tr>
											<th>Each</th>
											<th>Quantity</th>
											<th>Total</th>
										</tr>
									</thead>
									{cartData.lineItems && cartData.lineItems.map((item, index) => (
									<tbody>
										<tr>
											<td>{formatterService.formatCurrency(item.price.value.centAmount, currencyCode)}</td>
											<td>{item.quantity}</td>
											<td>{formatterService.formatCurrency(item.totalPrice.centAmount, currencyCode)}</td>
										</tr>
									</tbody>))}
								</table>
							</footer>
						</section>
						
					</aside>
				</main>
			)}
		</React.Fragment>
	);
};

export default Checkout;
