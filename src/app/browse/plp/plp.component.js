import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import ErrorBoundary from "react-error-boundary";
import axios from "axios";
import loadable from "@loadable/component";

import Loader from "../../common/loader.component";
import "./plp.scss";
import CONSTANTS from "../../../constants/constants";
import { formatterService } from "../../common/formatter.service";
import { createRequestBuilder } from "@commercetools/api-request-builder";
import { getClient } from "../../ct/client.js";
import { InitSession } from "../../app";
const projectKey = CONSTANTS[0].CT_PROJECT_KEY;
const reqBuilder = createRequestBuilder({ projectKey });
const BreadCrumb = loadable(
  () =>
    import(
      /* webpackChunkName: "bradcrumb" */ "../../global/header/breadcrumb.component"
    ),
  {
    fallback: (
      <ErrorBoundary>
        <Loader />
      </ErrorBoundary>
    )
  }
);

const Facets = loadable(
  () => import(/* webpackChunkName: "bradcrumb" */ "./facets.component"),
  {
    fallback: (
      <ErrorBoundary>
        <Loader />
      </ErrorBoundary>
    )
  }
);

const PLP = props => {
  // console.log('PLP props: ', props.priceGroup.id);
  const catSlug = props.location.pathname.split("/").pop();
  const [data, setData] = useState({ results: [] });
  const [facets, setFacets] = useState({ facets: [] });
  const [pageDetails, setPageDetails] = useState({});
  const [sort, setSort] = useState("");
  const [currentCat, setCurrentCat] = useState(catSlug);
  const [testy, setTesty] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currencyCode, setCurrencyCode] = useState("EUR");
  const currSort = sort;
  const [refinementBreadCrumbs, setRefinementBreadCrumbs] = useState({});

  //const repositoryId = props.site.repositoryId;
  const priceGroup = props.priceGroup.id;

  //const [url, setUrl] = useState(`products?totalResults=true&totalExpandedResults=true&catalogId=${repositoryId}&limit=60&offset=0${currSort}&categoryId=${path}&includeChildren=true&storePriceListGroupId=${priceGroup}`);
  console.log("cat slug = " + currentCat);

  useEffect(() => {
    let unmounted = false;

    let bearerToken;

    const fetchData = async () => {
      if (!localStorage.getItem("user_token")) {
        await InitSession();
      }
      bearerToken = JSON.parse(localStorage.getItem("user_token")).access_token;

      const categoryUrl = reqBuilder.categories
        .where(`slug(en="${catSlug}")`)
        .expand("ancestors[*]") //need ancestors for breadcrumbs
        .build();

      console.log("categoryUrl" + categoryUrl);
      const getCategoryRequest = {
        uri: categoryUrl,
        method: "GET",
        headers: {
          Authorization: "Bearer " + bearerToken
        }
      };
      await getClient()
        .execute(getCategoryRequest)
        .then(result => {
          console.log("test");
          let catId = -1;
          if (result.body.results && result.body.results.length > 0) {
            catId = result.body.results[0].id;
            setCurrentCat(result.body.results[0].name.en);
            setRefinementBreadCrumbs(result.body.results[0]);
            console.log("currentCat:" + result.body.results[0].name.en);
          }
          fetchProducts(catId);
        })
        .catch(function(e) {
          if (!unmounted) {
            setError(true);
            setErrorMessage(e.message);
          }
        });
    };

    const fetchProducts = async categoryId => {
      console.log("catId::" + categoryId);
      //create a PLP request to get the
      if (categoryId !== -1) {
        const categoryUrl = reqBuilder.productProjectionsSearch
          .filterByQuery(`categories.id:subtree("${categoryId}")`)
          //	.filterByQuery(`priceCurrency:"${currencyCode}"`)
          .facet("variants.price.centAmount:range (* to 1200)")
          .facet("variants.attributes.commonSize.key")
          .priceCurrency(`${currencyCode}`)
          //.priceCustomerGroup('99a11705-2a89-49c8-9c0d-362c248ae20e')
          .perPage(10)
          .build();

        const getProductFromSearch = {
          uri: categoryUrl,
          method: "GET",
          headers: {
            Authorization: "Bearer " + bearerToken
          }
        };

        await getClient()
          .execute(getProductFromSearch)
          .then(result => {
            setData(result.body);
          });
      }
    };
    fetchData();

    return function() {
      unmounted = true;
      //source.cancel('Cancelling in cleanup');
    };
  }, [priceGroup, currSort, currentCat, catSlug]);

  function onFacetClick(e, newValue) {
    e.preventDefault();
    //console.log('preset', url);
    //setUrl(`search${newValue}`);
    //console.log('postset', url);
  }

  return (
    <React.Fragment>
      <ErrorBoundary>
        <BreadCrumb
          display={props.breadcrumb}
          refinementBreadCrumbs={refinementBreadCrumbs}
        />
        <main className="plp">
          <header>
            <h1>{currentCat}</h1>
            <span>{data.totalResults} Results</span>
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
                    console.log("e.target.value:", e.target.value);
                    setSort(e.target.value);
                  }}
                >
                  <option value="">Default</option>
                  <option value="&sort=listPrice%3Aasc">
                    Price: Low to High
                  </option>
                  <option value="&sort=listPrice%3Adesc">
                    Price: High to Low
                  </option>
                </select>
              </fieldset>
            </form>
          </header>

          <Facets {...props} facets={facets} onFacetClick={onFacetClick} />
          <section>
            <ul className="product-list">
              {data.results.map(item => (
                <li key={item.slug.en}>
                  <figure>
                    <Link
                      rel="prefetch"
                      to={`/${item.name.en.replace(
                        /[^A-Z0-9]/gi,
                        "-"
                      )}/product/${item.slug.en}`}
                      tabIndex="-1"
                    >
                      <img
                        src={item.masterVariant.images[0].url}
                        alt="placeholder image"
                      />
                    </Link>
                    <figcaption>
                      {Object.keys(
                        item.masterVariant.attributes.filter(
                          obj => obj.name === "color"
                        )
                      ).length >= 1 ? (
                        <ul className="colors">
                          {Object.keys(item.masterVariant.attributes)
                            .filter(function(attr) {
                              console.log(attr.name);
                              return (
                                item.masterVariant.attributes[attr].name ===
                                "color"
                              );
                            })
                            .map(color => (
                              <li key={color.toString()}>
                                <span className="screen-reader">
                                  {
                                    item.masterVariant.attributes[color].value
                                      .key
                                  }
                                </span>
                              </li>
                            ))}
                        </ul>
                      ) : null}
                      <Link
                        to={`/${item.name.en.replace(
                          /[^A-Z0-9]/gi,
                          "-"
                        )}/product/${item.slug.en}`}
                      >
                        {item.name.en}
                      </Link>

                      {item.masterVariant.price !== null ? (
                        <React.Fragment>
                          <span className="sale">
                            {formatterService.formatCurrency(
                              item.masterVariant.price.value.centAmount,
                              "EUR"
                            )}
                          </span>
                        </React.Fragment>
                      ) : null}

                      <ul className="rating">
                        <li>☆</li>
                        <li>☆</li>
                        <li>☆</li>
                        <li>☆</li>
                        <li>☆</li>
                      </ul>
                    </figcaption>
                  </figure>
                </li>
              ))}
              <li>{/* <button>load more</button> */}</li>
            </ul>
          </section>
        </main>
      </ErrorBoundary>
    </React.Fragment>
  );
};

export default PLP;
