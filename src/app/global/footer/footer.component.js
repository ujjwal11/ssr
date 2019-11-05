import React from 'react';
import { Link } from 'react-router-dom';

import ErrorBoundary from 'react-error-boundary';

import './footer.scss';

const Footer = props => {
	return (
		<ErrorBoundary>
			<footer>
				<form>
					<legend>Be the first to know about daily sales!</legend>
					<fieldset>
						<input type="text" placeholder="Email Address" />
						<button type="submit" className="email-sumbmit">
							Submit
						</button>
					</fieldset>
				</form>

				<section>
					<h2>About Us</h2>
					<ul className="expanded">
						<li>
							<a href="">About King Size</a>
						</li>
						<li>
							<a href="">Careers</a>
						</li>
						<li>
							<a href="">Blog</a>
						</li>
						<li>
							<a href="">Our Stores</a>
						</li>
					</ul>
				</section>
				<section>
					<h2>Customer Service</h2>
					<ul>
						<li>
							<a href="">FAQs</a>
						</li>
						<li>
							<a href="">Orders &amp; Returns</a>
						</li>
						<li>
							<a href="">Shipping &amp; Returns</a>
						</li>
						<li>
							<a href="">Contact Us</a>
						</li>
					</ul>
				</section>
				<section>
					<h2>Shop</h2>
					<ul>
						<li>
							<a href="">Gift Cards</a>
						</li>
						<li>
							<a href="">Clearance</a>
						</li>
					</ul>
				</section>
				<section>
					<h2>More</h2>
					<ul>
						<li>
							<a href="">Privacy</a>
						</li>
						<li>
							<a href="">Legal Notice</a>
						</li>
						<li>
							<a href="">Terms of Use</a>
						</li>
						<li>
							<a href="">Sitemap</a>
						</li>
					</ul>
				</section>
			</footer>
		</ErrorBoundary>
	);
};

export default Footer;
