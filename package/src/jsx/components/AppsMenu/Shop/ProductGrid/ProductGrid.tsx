/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Fragment } from "react";
import Products from "./Products";

/// Data
import productData from "../productData";
// import PageTitle from "../../../../layouts/PageTitle";

const ProductGrid = () => {
  return (
    <Fragment>
      <div className="row">
        {productData.map((product) => (
          // @ts-expect-error
          <Products key={product.key} product={product} />
        ))}
      </div>
    </Fragment>
  );
};

export default ProductGrid;
