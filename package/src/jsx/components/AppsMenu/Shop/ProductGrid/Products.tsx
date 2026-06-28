import { Link } from "react-router-dom";

interface ProductType {
  previewImg: string;
  title: string;
  rating: JSX.Element;
  price: number;
  key?: string;
  imageList?: string[];
  availability?: string;
  productCode?: string;
  brand?: string;
  tags?: string[];
  des?: string;
}

interface PropType {
  product: ProductType;
}

const Products = ({ product }: PropType) => {
  const { previewImg, title, rating, price } = product;
  return (
    <div className="col-xl-2 col-xxl-3 col-md-4 col-sm-6">
      <div className="card product-grid-card">
        <div className="card-body">
          <div className="new-arrival-product">
            <div className="new-arrivals-img-contnent">
              <img className="img-fluid" src={previewImg} alt="" />
            </div>
            <div className="new-arrival-content text-center mt-3">
              <h5>
                <Link to="/ecom-product-detail">{title}</Link>
              </h5>
              {rating}
              <del className="discount">${price}</del>
              <span className="price">${price - 50}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
