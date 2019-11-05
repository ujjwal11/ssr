import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import axios from "axios";

import "./header.scss";
import CONSTANTS from "../../../constants/constants";
import { InitSession } from "../../app";
import { createRequestBuilder } from "@commercetools/api-request-builder";
import { getClient } from "../../ct/client.js";
const projectKey = CONSTANTS[0].CT_PROJECT_KEY;
const reqBuilder = createRequestBuilder({ projectKey });

const MegaNav = prop => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let unmounted = false;

    let bearerToken;

    const fetchData = async () => {
      if (!localStorage.getItem("user_token")) {
        await InitSession();
      }
      bearerToken = JSON.parse(localStorage.getItem("user_token")).access_token;

      const categoryUrl = reqBuilder.categories.perPage(200).build();

      console.log("categoryUrl1" + categoryUrl);
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
          console.log("result", result);
          if (!unmounted) {
            const categories = result.body.results;

            const l1Cats = categories.filter(cat => {
              return cat.ancestors && cat.ancestors.length === 0;
            });

            const l2Cats = categories.filter(cat => {
              return cat.ancestors && cat.ancestors.length === 1;
            });

            l2Cats.forEach(element => {
              const ancestor = element.ancestors[0];
              l1Cats
                .filter(e => e.id === ancestor.id)
                .map(e => {
                  if (e["childCategories"]) {
                    e["childCategories"].push(element);
                  } else {
                    e["childCategories"] = [];
                    e["childCategories"].push(element);
                  }
                });
            });

            console.log(l1Cats);
            setData(l1Cats);
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
  }, [error, errorMessage]);

  return (
    <nav>
      <ul>
        {data.map(item => (
          <li key={item.id}>
            <Link to={`/c/category/${item.slug.en}`}>{item.name.en}</Link>
            {item.childCategories !== null ? (
              <div className="nav-dropdown" data-section-nav={item.displayName}>
                {item.childCategories &&
                  item.childCategories.map(cat => (
                    <section key={cat.id}>
                      <h2>
                        <Link to={`/${item.slug.en}/category/${cat.slug.en}`}>
                          {cat.name.en}
                        </Link>
                      </h2>
                      <ul>
                        {cat.childCategories !== undefined
                          ? cat.childCategories.map(subCat => (
                              <li key={subCat.id}>
                                <Link
                                  to={`/${cat.slug.en}/category/${subCat.slug.en}`}
                                >
                                  {subCat.name.en}
                                </Link>
                              </li>
                            ))
                          : null}
                      </ul>
                    </section>
                  ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MegaNav;
