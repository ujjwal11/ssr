import React from 'react';
// import { BrowserRouter as Router, Route, Link, NavLink } from 'react-router-dom';

// import OwlCarousel from 'react-owl-carousel';
// import 'owl.carousel/dist/assets/owl.carousel.css';
// import 'owl.carousel/dist/assets/owl.theme.default.css';
// import ErrorBoundary from 'react-error-boundary';
// import { Carousel } from 'react-responsive-carousel';

import ErrorBoundary from 'react-error-boundary';
import loadable from '@loadable/component';

import Loader from '../common/loader.component';

import './home.scss';

const BreadCrumb = loadable(() => import(/* webpackChunkName: "bradcrumb" */ '../global/header/breadcrumb.component'), {
	fallback: (
		<ErrorBoundary>
			<Loader />
		</ErrorBoundary>
	)
});

const Home = props => {
	console.log('Home props: ', props);
	return (
		<React.Fragment>
			<BreadCrumb display={props.breadcrumb} />
			<main className="home">
				<section className="hero-banner">
					<figure>
						<img src="/assets/img/hero-banner.PNG" alt="hero banner image" />
						<figcaption>
							<p>minimal designs &#8208;</p>
							<h1>Exclusive Styles At Unbelievable prices</h1>
							<p>up to 70&#37; off on 15,000&#43; new arrivals</p>
							<br />
							<a href="#">shop now</a>
						</figcaption>
					</figure>
				</section>

				<section className="living-spaces-1">
					<figure>
						<img src="/assets/img/hero1.PNG" alt="hero image 1" />
						<figcaption>
							<p>living spaces</p>
							<h1>A Dreamy Colour full Living Clothing</h1>
							<p>A relaxing retreat with timeless pallete</p>
							<a href="#">shop now</a>
						</figcaption>
					</figure>
				</section>

				<section className="living-spaces-2">
					<figure className="group-images">
						<img src="/assets/img/hero2.PNG" alt="hero image 2" />
						<img src="/assets/img/hero3.PNG" alt="hero image 3" />
					</figure>
				</section>

				<section className="best-seller">
					<h1>Best Sellers</h1>
					<figure>
						<img src="/assets/img/best-seller-image.PNG" alt="Best Seller Image 1" />
						<figcaption>
							<a href="#">Cowl Neck Tweed Pullover</a>
							<p>
								<del>&#36;159.00</del> &#8208; &#36;110.99
							</p>
						</figcaption>
					</figure>
					<figure>
						<img src="/assets/img/best-seller-image.PNG" alt="Best Seller Image 2" />
						<figcaption>
							<a href="#">Scoop Neck Knit Top</a>
							<p>
								<del>&#36;159.00</del> &#8208; &#36;110.99
							</p>
						</figcaption>
					</figure>
					<figure>
						<img src="/assets/img/best-seller-image.PNG" alt="Best Seller Image 3" />
						<figcaption>
							<a href="#">Scoop Neck Knit Top</a>
							<p>
								<del>&#36;159.00</del> &#8208; &#36;110.99
							</p>
						</figcaption>
					</figure>
					<figure>
						<img src="/assets/img/best-seller-image.PNG" alt="Best Seller Image 4" />
						<figcaption>
							<a href="#">Long Sleeve Raglan Button</a>
							<p>
								<del>&#36;159.00</del> &#8208; &#36;110.99
							</p>
						</figcaption>
					</figure>
					<figure>
						<img src="/assets/img/best-seller-image.PNG" alt="Best Seller Image 5" />
						<figcaption>
							<a href="#">Quilted Jacket</a>
							<p>
								<del>&#36;159.00</del> &#8208; &#36;110.99
							</p>
						</figcaption>
					</figure>
				</section>

				<section className="picture-this">
					<h1>Picture This</h1>
					<p>Our Clothing looks a lot better in your home. Click a pic and share to get featured</p>
					<p>&#35;clothing</p>

					{/* <ErrorBoundary>
						<Carousel className="owl-theme carousel1" margin={10} nav autoplayHoverPause items={5} lazyLoad rewind responsive={owlRespoinsive} dots={false}>
							<li>
								<img className="owl-lazy" data-src="/assets/img/best-seller-image.PNG" alt="" />
							</li>
							<li>
								<img className="owl-lazy" data-src="/assets/img/best-seller-image1.PNG" alt="" />
							</li>
							<li>
								<img className="owl-lazy" data-src="/assets/img/best-seller-image.PNG" alt="" />
							</li>
							<li>
								<img className="owl-lazy" data-src="/assets/img/best-seller-image1.PNG" alt="" />
							</li>
							<li>
								<img className="owl-lazy" data-src="/assets/img/best-seller-image.PNG" alt="" />
							</li>
							<li>
								<img className="owl-lazy" data-src="/assets/img/best-seller-image1.PNG" alt="" />
							</li>
							<li>
								<img className="owl-lazy" data-src="/assets/img/best-seller-image.PNG" alt="" />
							</li>
							<li>
								<img className="owl-lazy" data-src="/assets/img/best-seller-image1.PNG" alt="" />
							</li>
						</Carousel>
					</ErrorBoundary> */}
					<button className="btn screen-reader">Stop</button>
				</section>
			</main>
		</React.Fragment>
	);
};

export default Home;
