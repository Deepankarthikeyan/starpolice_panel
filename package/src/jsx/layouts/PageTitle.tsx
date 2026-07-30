interface PageTitleType {
  motherMenu: string;
  activeMenu: string;
  pageContent: string;
}

const PageTitle = ({ motherMenu, activeMenu }: PageTitleType) => {
  return (
    <div className="row page-titles spa-page-titles mx-0">
      <ol className="breadcrumb spa-page-breadcrumb mb-0">
        <li className="breadcrumb-item spa-breadcrumb-panel">
          <span>{motherMenu}</span>
        </li>
        <li className="breadcrumb-item spa-breadcrumb-page active" aria-current="page">
          <span>{activeMenu}</span>
        </li>
      </ol>
    </div>
  );
};

export default PageTitle;
