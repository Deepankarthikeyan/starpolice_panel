import { Link } from "react-router-dom";
import { Nav, Tab, Dropdown } from "react-bootstrap";
import { IMAGES, SVGICON } from "../Dashboard/Content";
import circle from "./../../../assets/images/circle.svg";

interface tabledataType {
  image: string;
  title: string;
  subtitle: string;
  rating: string;
  sales: string;
  intrest: string;
}

const tabledata: tabledataType[] = [
  {
    image: IMAGES.food1,
    title: "Beef Steak with Fried Potato",
    subtitle: "Dinner",
    rating: "5.0",
    sales: "1,210",
    intrest: "20%",
  },
  {
    image: IMAGES.food2,
    title: "Pancake with Honey",
    subtitle: "Breakfast",
    rating: "4.9",
    sales: "1,110",
    intrest: "13&",
  },
  {
    image: IMAGES.food3,
    title: "Japanese Beef Ramen",
    subtitle: "Lunch",
    rating: "4.8",
    sales: "1,050",
    intrest: "18%",
  },
  {
    image: IMAGES.food4,
    title: "Mixed Salad",
    subtitle: "Lunch",
    rating: "5.0",
    sales: "1,400",
    intrest: "17%",
  },
  {
    image: IMAGES.food5,
    title: "Snack Beef Meatball with Vegetable",
    subtitle: "Snack",
    rating: "4.8",
    sales: "1,456",
    intrest: "15%",
  },
];
const tabledata2: tabledataType[] = [
  {
    image: IMAGES.food5,
    title: "Beef Steak with Fried Potato",
    subtitle: "Breakfast",
    rating: "5.0",
    sales: "1,210",
    intrest: "20%",
  },
  {
    image: IMAGES.food2,
    title: "Pancake with Honey",
    subtitle: "Breakfast",
    rating: "4.9",
    sales: "1,110",
    intrest: "13&",
  },
  {
    image: IMAGES.food3,
    title: "Japanese Beef Ramen",
    subtitle: "Breakfast",
    rating: "4.8",
    sales: "1,050",
    intrest: "18%",
  },
];
const tabledata3: tabledataType[] = [
  {
    image: IMAGES.food2,
    title: "Beef Steak with Fried Potato",
    subtitle: "Lunch",
    rating: "5.0",
    sales: "1,210",
    intrest: "20%",
  },
  {
    image: IMAGES.food2,
    title: "Pancake with Honey",
    subtitle: "Lunch",
    rating: "4.9",
    sales: "1,110",
    intrest: "13&",
  },
  {
    image: IMAGES.food3,
    title: "Japanese Beef Ramen",
    subtitle: "Lunch",
    rating: "4.8",
    sales: "1,050",
    intrest: "18%",
  },
  {
    image: IMAGES.food4,
    title: "Mixed Salad",
    subtitle: "Lunch",
    rating: "5.0",
    sales: "1,400",
    intrest: "17%",
  },
];
const tabledata4: tabledataType[] = [
  {
    image: IMAGES.food3,
    title: "Mixed Salad",
    subtitle: "Snack",
    rating: "5.0",
    sales: "1,400",
    intrest: "17%",
  },
  {
    image: IMAGES.food5,
    title: "Snack Beef Meatball with Vegetable",
    subtitle: "Snack",
    rating: "4.8",
    sales: "1,456",
    intrest: "15%",
  },
];

const Food = () => {
  return (
    <div className="card">
      <Tab.Container defaultActiveKey={"All"}>
        <div className="card-header border-0 pb-0 flex-wrap">
          <h4 className="mb-0">Food Menu</h4>
          <Nav as="ul" className="nav nav-tabs food-tabs">
            <Nav.Item as="li">
              <Nav.Link eventKey={"All"} id="home-tab">
                All Means
              </Nav.Link>
            </Nav.Item>
            <Nav.Item as="li" className="nav-item" role="presentation">
              <Nav.Link eventKey={"Break"}>Breakefast</Nav.Link>
            </Nav.Item>
            <Nav.Item as="li" className="nav-item" role="presentation">
              <Nav.Link eventKey={"Lunch"}>Lunch</Nav.Link>
            </Nav.Item>
            <Nav.Item as="li" className="nav-item" role="presentation">
              <Nav.Link eventKey={"Snack"}>Snack</Nav.Link>
            </Nav.Item>
          </Nav>
        </div>
        <div className="card-body">
          <Tab.Content id="myTabContent">
            <Tab.Pane eventKey={"All"}>
              <div className="table-responsive">
                <table className="table table-details">
                  <tbody>
                    {tabledata.map((item, ind) => (
                      <tr key={ind}>
                        <td style={{ width: "100px" }}>
                          <div className="food-menu">
                            <img
                              className="me-3 rounded avatar avatar-xl"
                              src={item.image}
                              alt="DexignZone"
                            />
                            <div className="food-info">
                              <span className=" badge badge-sm badge-primary mb-2">
                                {item.subtitle}
                              </span>
                              <h5>
                                <Link to={"#"}>{item.title}</Link>
                              </h5>
                            </div>
                          </div>
                        </td>
                        <td>
                          <ul className="food-review">
                            <li>
                              <i className="fa fa-star"></i>
                            </li>
                            <li>
                              <h5 className="font-w700">{item.rating}</h5>
                            </li>
                          </ul>
                        </td>
                        <td>
                          <ul className="d-flex">
                            <li>
                              <svg
                                className="me-3"
                                width="62"
                                height="53"
                                viewBox="0 0 62 53"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8 31.7387C8 30.1102 6.20914 28.7901 4 28.7901C1.79086 28.7901 0 30.1102 0 31.7387V50.0515C0 51.6799 1.79086 53 4 53C6.20914 53 8 51.6799 8 50.0515V31.7387Z"
                                  fill="var(--primary)"
                                />
                                <path
                                  d="M26 21.2318C26 19.6242 24.2091 18.321 22 18.321C19.7909 18.321 18 19.6242 18 21.2318V50.0892C18 51.6968 19.7909 53 22 53C24.2091 53 26 51.6968 26 50.0892V21.2318Z"
                                  fill="var(--primary)"
                                />
                                <path
                                  d="M44 2.96576C44 1.32781 42.2091 0 40 0C37.7909 0 36 1.32782 36 2.96576V50.0342C36 51.6722 37.7909 53 40 53C42.2091 53 44 51.6722 44 50.0342V2.96576Z"
                                  fill="var(--primary)"
                                />
                                <path
                                  d="M62 26.5054C62 24.8762 60.2091 23.5556 58 23.5556C55.7909 23.5556 54 24.8762 54 26.5054V50.0502C54 51.6793 55.7909 53 58 53C60.2091 53 62 51.6793 62 50.0502V26.5054Z"
                                  fill="var(--primary)"
                                />
                              </svg>
                            </li>
                            <li>
                              <h3 className="mb-0 font-w500 fs-22">
                                {item.sales}
                              </h3>
                              <span>Total Sales</span>
                            </li>
                          </ul>
                        </td>
                        <td>
                          <ul className="d-flex align-items-center">
                            <li>
                              <svg
                                width="40"
                                height="40"
                                viewBox="0 0 40 40"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M39.9411 3.05888C39.9411 1.40202 38.598 0.0588751 36.9411 0.0588751H9.94113C8.28427 0.0588751 6.94113 1.40202 6.94113 3.05888C6.94113 4.71573 8.28427 6.05888 9.94113 6.05888H33.9411V30.0589C33.9411 31.7157 35.2843 33.0589 36.9411 33.0589C38.598 33.0589 39.9411 31.7157 39.9411 30.0589V3.05888ZM5.12132 39.1213L39.0624 5.1802L34.8198 0.937555L0.87868 34.8787L5.12132 39.1213Z"
                                  fill="var(--primary)"
                                />
                              </svg>
                            </li>
                            <li className="ms-3">
                              <h3 className="mb-0 font-w500 fs-22">
                                {item.intrest}
                              </h3>
                              <span>Interest</span>
                            </li>
                          </ul>
                        </td>
                        <td>
                          <img src={circle} alt="" />
                        </td>
                        <td className="text-end">
                          <Dropdown className="custom-dropdown">
                            <Dropdown.Toggle
                              as="div"
                              className="i-false btn sharp  btn-light"
                            >
                              {SVGICON.dots}
                            </Dropdown.Toggle>
                            <Dropdown.Menu
                              className="dropdown-menu-end"
                              align="end"
                            >
                              <Dropdown.Item>Option 1</Dropdown.Item>
                              <Dropdown.Item>Option 2</Dropdown.Item>
                              <Dropdown.Item>Option 3</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tab.Pane>
            <Tab.Pane eventKey={"Break"}>
              <div className="table-responsive">
                <table className="table table-details">
                  <tbody>
                    {tabledata2.map((item, ind) => (
                      <tr key={ind}>
                        <td style={{ width: "100px" }}>
                          <div className="food-menu">
                            <img
                              className="me-3 rounded avatar avatar-xl"
                              src={item.image}
                              alt="DexignZone"
                            />
                            <div className="food-info">
                              <span className=" badge badge-sm badge-primary mb-2">
                                {item.subtitle}
                              </span>
                              <h5>
                                <Link to={"#"}>{item.title}</Link>
                              </h5>
                            </div>
                          </div>
                        </td>
                        <td>
                          <ul className="food-review">
                            <li>
                              <i className="fa fa-star"></i>
                            </li>
                            <li>
                              <h5 className="font-w700">{item.rating}</h5>
                            </li>
                          </ul>
                        </td>
                        <td>
                          <ul className="d-flex">
                            <li>
                              <svg
                                className="me-3"
                                width="62"
                                height="53"
                                viewBox="0 0 62 53"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8 31.7387C8 30.1102 6.20914 28.7901 4 28.7901C1.79086 28.7901 0 30.1102 0 31.7387V50.0515C0 51.6799 1.79086 53 4 53C6.20914 53 8 51.6799 8 50.0515V31.7387Z"
                                  fill="var(--primary)"
                                />
                                <path
                                  d="M26 21.2318C26 19.6242 24.2091 18.321 22 18.321C19.7909 18.321 18 19.6242 18 21.2318V50.0892C18 51.6968 19.7909 53 22 53C24.2091 53 26 51.6968 26 50.0892V21.2318Z"
                                  fill="var(--primary)"
                                />
                                <path
                                  d="M44 2.96576C44 1.32781 42.2091 0 40 0C37.7909 0 36 1.32782 36 2.96576V50.0342C36 51.6722 37.7909 53 40 53C42.2091 53 44 51.6722 44 50.0342V2.96576Z"
                                  fill="var(--primary)"
                                />
                                <path
                                  d="M62 26.5054C62 24.8762 60.2091 23.5556 58 23.5556C55.7909 23.5556 54 24.8762 54 26.5054V50.0502C54 51.6793 55.7909 53 58 53C60.2091 53 62 51.6793 62 50.0502V26.5054Z"
                                  fill="var(--primary)"
                                />
                              </svg>
                            </li>
                            <li>
                              <h3 className="mb-0 font-w500 fs-22">
                                {item.sales}
                              </h3>
                              <span>Total Sales</span>
                            </li>
                          </ul>
                        </td>
                        <td>
                          <ul className="d-flex align-items-center">
                            <li>
                              <svg
                                width="40"
                                height="40"
                                viewBox="0 0 40 40"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M39.9411 3.05888C39.9411 1.40202 38.598 0.0588751 36.9411 0.0588751H9.94113C8.28427 0.0588751 6.94113 1.40202 6.94113 3.05888C6.94113 4.71573 8.28427 6.05888 9.94113 6.05888H33.9411V30.0589C33.9411 31.7157 35.2843 33.0589 36.9411 33.0589C38.598 33.0589 39.9411 31.7157 39.9411 30.0589V3.05888ZM5.12132 39.1213L39.0624 5.1802L34.8198 0.937555L0.87868 34.8787L5.12132 39.1213Z"
                                  fill="var(--primary)"
                                />
                              </svg>
                            </li>
                            <li className="ms-3">
                              <h3 className="mb-0 font-w500 fs-22">
                                {item.intrest}
                              </h3>
                              <span>Interest</span>
                            </li>
                          </ul>
                        </td>
                        <td>
                          <img src={circle} alt="" />
                        </td>
                        <td className="text-end">
                          <Dropdown className="custom-dropdown">
                            <Dropdown.Toggle
                              as="div"
                              className="i-false btn sharp  btn-light"
                            >
                              {SVGICON.dots}
                            </Dropdown.Toggle>
                            <Dropdown.Menu
                              className="dropdown-menu-end"
                              align="end"
                            >
                              <Dropdown.Item>Option 1</Dropdown.Item>
                              <Dropdown.Item>Option 2</Dropdown.Item>
                              <Dropdown.Item>Option 3</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tab.Pane>
            <Tab.Pane eventKey={"Lunch"}>
              <div className="table-responsive">
                <table className="table table-details">
                  <tbody>
                    {tabledata3.map((item, ind) => (
                      <tr key={ind}>
                        <td style={{ width: "100px" }}>
                          <div className="food-menu">
                            <img
                              className="me-3 rounded avatar avatar-xl"
                              src={item.image}
                              alt="DexignZone"
                            />
                            <div className="food-info">
                              <span className=" badge badge-sm badge-primary mb-2">
                                {item.subtitle}
                              </span>
                              <h5>
                                <Link to={"#"}>{item.title}</Link>
                              </h5>
                            </div>
                          </div>
                        </td>
                        <td>
                          <ul className="food-review">
                            <li>
                              <i className="fa fa-star"></i>
                            </li>
                            <li>
                              <h5 className="font-w700">{item.rating}</h5>
                            </li>
                          </ul>
                        </td>
                        <td>
                          <ul className="d-flex">
                            <li>
                              <svg
                                className="me-3"
                                width="62"
                                height="53"
                                viewBox="0 0 62 53"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8 31.7387C8 30.1102 6.20914 28.7901 4 28.7901C1.79086 28.7901 0 30.1102 0 31.7387V50.0515C0 51.6799 1.79086 53 4 53C6.20914 53 8 51.6799 8 50.0515V31.7387Z"
                                  fill="var(--primary)"
                                />
                                <path
                                  d="M26 21.2318C26 19.6242 24.2091 18.321 22 18.321C19.7909 18.321 18 19.6242 18 21.2318V50.0892C18 51.6968 19.7909 53 22 53C24.2091 53 26 51.6968 26 50.0892V21.2318Z"
                                  fill="var(--primary)"
                                />
                                <path
                                  d="M44 2.96576C44 1.32781 42.2091 0 40 0C37.7909 0 36 1.32782 36 2.96576V50.0342C36 51.6722 37.7909 53 40 53C42.2091 53 44 51.6722 44 50.0342V2.96576Z"
                                  fill="var(--primary)"
                                />
                                <path
                                  d="M62 26.5054C62 24.8762 60.2091 23.5556 58 23.5556C55.7909 23.5556 54 24.8762 54 26.5054V50.0502C54 51.6793 55.7909 53 58 53C60.2091 53 62 51.6793 62 50.0502V26.5054Z"
                                  fill="var(--primary)"
                                />
                              </svg>
                            </li>
                            <li>
                              <h3 className="mb-0 font-w500 fs-22">
                                {item.sales}
                              </h3>
                              <span>Total Sales</span>
                            </li>
                          </ul>
                        </td>
                        <td>
                          <ul className="d-flex align-items-center">
                            <li>
                              <svg
                                width="40"
                                height="40"
                                viewBox="0 0 40 40"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M39.9411 3.05888C39.9411 1.40202 38.598 0.0588751 36.9411 0.0588751H9.94113C8.28427 0.0588751 6.94113 1.40202 6.94113 3.05888C6.94113 4.71573 8.28427 6.05888 9.94113 6.05888H33.9411V30.0589C33.9411 31.7157 35.2843 33.0589 36.9411 33.0589C38.598 33.0589 39.9411 31.7157 39.9411 30.0589V3.05888ZM5.12132 39.1213L39.0624 5.1802L34.8198 0.937555L0.87868 34.8787L5.12132 39.1213Z"
                                  fill="var(--primary)"
                                />
                              </svg>
                            </li>
                            <li className="ms-3">
                              <h3 className="mb-0 font-w500 fs-22">
                                {item.intrest}
                              </h3>
                              <span>Interest</span>
                            </li>
                          </ul>
                        </td>
                        <td>
                          <img src={circle} alt="" />
                        </td>
                        <td className="text-end">
                          <Dropdown className="custom-dropdown">
                            <Dropdown.Toggle
                              as="div"
                              className="i-false btn sharp  btn-light"
                            >
                              {SVGICON.dots}
                            </Dropdown.Toggle>
                            <Dropdown.Menu
                              className="dropdown-menu-end"
                              align="end"
                            >
                              <Dropdown.Item>Option 1</Dropdown.Item>
                              <Dropdown.Item>Option 2</Dropdown.Item>
                              <Dropdown.Item>Option 3</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tab.Pane>
            <Tab.Pane eventKey={"Snack"}>
              <div className="table-responsive">
                <table className="table table-details">
                  <tbody>
                    {tabledata4.map((item, ind) => (
                      <tr key={ind}>
                        <td style={{ width: "100px" }}>
                          <div className="food-menu">
                            <img
                              className="me-3 rounded avatar avatar-xl"
                              src={item.image}
                              alt="DexignZone"
                            />
                            <div className="food-info">
                              <span className=" badge badge-sm badge-primary mb-2">
                                {item.subtitle}
                              </span>
                              <h5>
                                <Link to={"#"}>{item.title}</Link>
                              </h5>
                            </div>
                          </div>
                        </td>
                        <td>
                          <ul className="food-review">
                            <li>
                              <i className="fa fa-star"></i>
                            </li>
                            <li>
                              <h5 className="font-w700">{item.rating}</h5>
                            </li>
                          </ul>
                        </td>
                        <td>
                          <ul className="d-flex">
                            <li>
                              <svg
                                className="me-3"
                                width="62"
                                height="53"
                                viewBox="0 0 62 53"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8 31.7387C8 30.1102 6.20914 28.7901 4 28.7901C1.79086 28.7901 0 30.1102 0 31.7387V50.0515C0 51.6799 1.79086 53 4 53C6.20914 53 8 51.6799 8 50.0515V31.7387Z"
                                  fill="var(--primary)"
                                />
                                <path
                                  d="M26 21.2318C26 19.6242 24.2091 18.321 22 18.321C19.7909 18.321 18 19.6242 18 21.2318V50.0892C18 51.6968 19.7909 53 22 53C24.2091 53 26 51.6968 26 50.0892V21.2318Z"
                                  fill="var(--primary)"
                                />
                                <path
                                  d="M44 2.96576C44 1.32781 42.2091 0 40 0C37.7909 0 36 1.32782 36 2.96576V50.0342C36 51.6722 37.7909 53 40 53C42.2091 53 44 51.6722 44 50.0342V2.96576Z"
                                  fill="var(--primary)"
                                />
                                <path
                                  d="M62 26.5054C62 24.8762 60.2091 23.5556 58 23.5556C55.7909 23.5556 54 24.8762 54 26.5054V50.0502C54 51.6793 55.7909 53 58 53C60.2091 53 62 51.6793 62 50.0502V26.5054Z"
                                  fill="var(--primary)"
                                />
                              </svg>
                            </li>
                            <li>
                              <h3 className="mb-0 font-w500 fs-22">
                                {item.sales}
                              </h3>
                              <span>Total Sales</span>
                            </li>
                          </ul>
                        </td>
                        <td>
                          <ul className="d-flex align-items-center">
                            <li>
                              <svg
                                width="40"
                                height="40"
                                viewBox="0 0 40 40"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M39.9411 3.05888C39.9411 1.40202 38.598 0.0588751 36.9411 0.0588751H9.94113C8.28427 0.0588751 6.94113 1.40202 6.94113 3.05888C6.94113 4.71573 8.28427 6.05888 9.94113 6.05888H33.9411V30.0589C33.9411 31.7157 35.2843 33.0589 36.9411 33.0589C38.598 33.0589 39.9411 31.7157 39.9411 30.0589V3.05888ZM5.12132 39.1213L39.0624 5.1802L34.8198 0.937555L0.87868 34.8787L5.12132 39.1213Z"
                                  fill="var(--primary)"
                                />
                              </svg>
                            </li>
                            <li className="ms-3">
                              <h3 className="mb-0 font-w500 fs-22">
                                {item.intrest}
                              </h3>
                              <span>Interest</span>
                            </li>
                          </ul>
                        </td>
                        <td>
                          <img src={circle} alt="" />
                        </td>
                        <td className="text-end">
                          <Dropdown className="custom-dropdown">
                            <Dropdown.Toggle
                              as="div"
                              className="i-false btn sharp  btn-light"
                            >
                              {SVGICON.dots}
                            </Dropdown.Toggle>
                            <Dropdown.Menu
                              className="dropdown-menu-end"
                              align="end"
                            >
                              <Dropdown.Item>Option 1</Dropdown.Item>
                              <Dropdown.Item>Option 2</Dropdown.Item>
                              <Dropdown.Item>Option 3</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </div>
      </Tab.Container>
    </div>
  );
};

export default Food;
