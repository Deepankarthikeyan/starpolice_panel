interface PageTitleType {
  motherMenu: string;
  activeMenu: string;
  pageContent: string;
}

const PageTitle = ({ motherMenu, activeMenu }: PageTitleType) => {
  return (
    <div className="row page-titles spa-page-titles mx-0">
      <nav className="spa-page-breadcrumb" aria-label="Breadcrumb">
        <span className="spa-breadcrumb-panel">{motherMenu}</span>
        <span className="spa-breadcrumb-separator" aria-hidden="true">
          &gt;
        </span>
        <span className="spa-breadcrumb-page">{activeMenu}</span>
      </nav>
    </div>
  );
};

export default PageTitle;
