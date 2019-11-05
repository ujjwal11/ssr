import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// import axios from 'axios';

import "./header.scss";
import CONSTANTS from "../../../constants/constants";

const BreadCrumb = props => {
  return (
    <React.Fragment>
      {props.display ? (
        <nav className="breadcrumb-nav">
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            {props.refinementBreadCrumbs &&
              props.refinementBreadCrumbs.ancestors &&
              props.refinementBreadCrumbs.ancestors.length > 0 &&
              props.refinementBreadCrumbs.ancestors[0].obj && (
                <li>
                  <Link
                    to={`/c/category/${props.refinementBreadCrumbs.ancestors[0].obj.slug.en}`}
                  >
                    {props.refinementBreadCrumbs.ancestors[0].obj.name.en}
                  </Link>
                </li>
              )}
            {props.refinementBreadCrumbs && props.refinementBreadCrumbs.name && (
              <li>
                <Link to={`/c/category/${props.refinementBreadCrumbs.slug.en}`}>
                  {props.refinementBreadCrumbs.name.en}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      ) : null}
    </React.Fragment>
  );
};

export default BreadCrumb;
