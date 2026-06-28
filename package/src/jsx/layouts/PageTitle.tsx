import { Link } from "react-router-dom";

interface PageTitleType {
  motherMenu: string;
  activeMenu: string;
  pageContent: string;
}

const PageTitle = ({ motherMenu, activeMenu }: PageTitleType) => {
  return (
    <>
      <div className="row page-titles mx-0">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active">
            <Link to={`#`}>{motherMenu}</Link>
          </li>
          <li className="breadcrumb-item  ">
            <Link to={`#`}>{activeMenu}</Link>
          </li>
        </ol>
      </div>
    </>
  );
};

export default PageTitle;
