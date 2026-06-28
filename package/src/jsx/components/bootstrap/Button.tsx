import { Fragment, useState } from "react";
import { Link } from "react-scroll";
import Highlight from "react-highlight";
import {
  Row,
  Col,
  Card,
  Button,
  Dropdown,
  ButtonGroup,
  Tab,
  Nav,
} from "react-bootstrap";
//import PageTitle from "../../layouts/PageTitle";

interface sidebarLinkType {
  title: string;
  to: string;
}
const sidebarLink: sidebarLinkType[] = [
  { title: "Default Button", to: "default-button" },
  { title: "Buttons With Icon", to: "button-with-icon" },
  { title: "Button Light", to: "button-light" },
  { title: "Default Outline Button", to: "default-outline-button" },
  { title: "Button Sizes", to: "button-sizes" },
  { title: "Button Sizes Icon", to: "button-size-icon" },
  { title: "Outline Button Sizes", to: "outline-button-sizes" },  
  { title: "Button Right Icons", to: "button-right-icons" },
  { title: "Button Left Icons", to: "button-left-icons" },
  { title: "Square Buttons", to: "square-buttons" },
  { title: "Square Outline Buttons", to: "square-outline-buttons" },
  { title: "Rounded Button", to: "rounded-button" },
  { title: "Rounded Outline Buttons", to: "rounded-outline-buttons" },
  { title: "Dropdown Button", to: "dropdown-button" },
  { title: "Buttons Transparent", to: "buttons-transparent" },
  { title: "Buttons Transparent Light", to: "buttons-transparent-light" },
  { title: "Disabled Button", to: "disabled-button" },
  { title: "Socia icon Buttons with Name", to: "socia-icon-buttons" },
];

const UiButton = () => {
  const [activeLink, setActiveLink] = useState<number>(0);
  return (
    <Fragment>
      <div className="row ">
        <div className="col-xl-12">
          <div className="page-titles">
            <div className="d-flex align-items-center">
              <h2 className="heading">Button</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="element-area">
        <div className="demo-view">
          <div className="container-fluid pt-0 ps-0 pe-lg-4 pe-0 ">
            <div className="btn-page">
              <Row>
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="default-button">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Buttons</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            Default button style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button className="me-2" variant="primary">
                              Primary
                            </Button>
                            <Button className="me-2" variant="secondary">
                              Secondary
                            </Button>
                            <Button className="me-2" variant="success">
                              Success
                            </Button>
                            <Button className="me-2" variant="danger">
                              Danger
                            </Button>
                            <Button className="me-2" variant="warning">
                              Warning
                            </Button>
                            <Button className="me-2" variant="info">
                              Info
                            </Button>
                            <Button className="me-2" variant="light">
                              Light
                            </Button>
                            <Button variant="dark">Dark</Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
    <div className="card-body">
      <Button className="me-2" variant="primary">
        Primary
      </Button>
      <Button className="me-2" variant="secondary">
        Secondary
      </Button>
      <Button className="me-2" variant="success">
        Success
      </Button>
      <Button className="me-2" variant="danger">
        Danger
      </Button>
      <Button className="me-2" variant="warning">
        Warning
      </Button>
      <Button className="me-2" variant="info">
        Info
      </Button>
      <Button className="me-2" variant="light">
        Light
      </Button>
      <Button variant="dark">Dark</Button>
    </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="button-with-icon">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Buttons With Icon</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            Button Icon style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button className="me-2" variant="primary">
                              <i className="fa-brands fa-accusoft me-2" />
                              Primary
                            </Button>
                            <Button className="me-2" variant="secondary">
                              <i className="fa-solid fa-table-cells-large me-2"></i>
                              Secondary
                            </Button>
                            <Button className="me-2" variant="success">
                              <i className="fa-solid fa-gear me-2"></i>Success
                            </Button>
                            <Button className="me-2" variant="danger">
                              <i className="fa-solid fa-circle-exclamation me-2"></i>
                              Danger
                            </Button>
                            <Button className="me-2" variant="warning">
                              <i className="fa-solid fa-image me-2"></i> Warning
                            </Button>
                            <Button className="me-2" variant="info">
                              <i className="fa-solid fa-phone-volume me-2"></i>
                              Info
                            </Button>
                            <Button className="me-2" variant="light">
                              <i className="fa-solid fa-lock me-2"></i> Light
                            </Button>
                            <Button variant="dark">
                              <i className="fa-solid fa-circle-play me-2"></i>
                              Dark
                            </Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
    <div className="card-body">
      <Button className="me-2" variant="primary">
        <i className="fa-brands fa-accusoft me-2" />Primary
      </Button>
      <Button className="me-2" variant="secondary">
       <i className="fa-solid fa-table-cells-large me-2"></i>Secondary
      </Button>
      <Button className="me-2" variant="success">
       <i className="fa-solid fa-gear me-2"></i>Success
      </Button>
      <Button className="me-2" variant="danger">
       <i className="fa-solid fa-circle-exclamation me-2"></i>Danger
      </Button>
      <Button className="me-2" variant="warning">
        <i className="fa-solid fa-image me-2"></i> Warning
      </Button>
      <Button className="me-2" variant="info">
       <i className="fa-solid fa-phone-volume me-2"></i>Info
      </Button>
      <Button className="me-2" variant="light">
       <i className="fa-solid fa-lock me-2"></i> Light
      </Button>
      <Button variant="dark"><i className="fa-solid fa-circle-play me-2"></i>Dark</Button>
    </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>

                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="button-light">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Buttons</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            Button Light style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button className="me-2" variant="primary light">
                              Primary
                            </Button>
                            <Button className="me-2" variant="secondary light">
                              Secondary
                            </Button>
                            <Button className="me-2" variant="success light">
                              Success
                            </Button>
                            <Button className="me-2" variant="danger light">
                              Danger
                            </Button>
                            <Button className="me-2" variant="warning light">
                              Warning
                            </Button>
                            <Button className="me-2" variant="info light">
                              Info
                            </Button>
                            <Button className="me-2" variant="light light">
                              Light
                            </Button>
                            <Button variant="dark light">Dark</Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
    <div className="card-body">
      <Button className="me-2" variant="primary light">
        Primary
      </Button>
      <Button className="me-2" variant="secondary light">
        Secondary
      </Button>
      <Button className="me-2" variant="success light">
        Success
      </Button>
      <Button className="me-2" variant="danger light">
        Danger
      </Button>
      <Button className="me-2" variant="warning light">
        Warning
      </Button>
      <Button className="me-2" variant="info light">
        Info
      </Button>
      <Button className="me-2" variant="light light">
        Light
      </Button>
      <Button variant="dark light">Dark</Button>
      </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="default-outline-button">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Outline Buttons</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            Default outline button style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button className="me-2" variant="outline-primary">
                              Primary
                            </Button>
                            <Button
                              className="me-2"
                              variant="outline-secondary"
                            >
                              Secondary
                            </Button>
                            <Button className="me-2" variant="outline-success">
                              Success
                            </Button>
                            <Button className="me-2" variant="outline-danger">
                              Danger
                            </Button>
                            <Button className="me-2" variant="outline-warning">
                              Warning
                            </Button>
                            <Button className="me-2" variant="outline-info">
                              Info
                            </Button>
                            <Button className="me-2" variant="outline-light">
                              Light
                            </Button>
                            <Button variant="outline-dark">Dark</Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
    <div className="card-body">
      <Button className="me-2" variant="outline-primary">
        Primary
      </Button>
      <Button className="me-2" variant="outline-secondary">
        Secondary
      </Button>
      <Button className="me-2" variant="outline-success">
        Success
      </Button>
      <Button className="me-2" variant="outline-danger">
        Danger
      </Button>
      <Button className="me-2" variant="outline-warning">
        Warning
      </Button>
      <Button className="me-2" variant="outline-info">
        Info
      </Button>
      <Button className="me-2" variant="outline-light">
        Light
      </Button>
      <Button variant="outline-dark">Dark</Button>
    </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="button-sizes">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Button Sizes</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            add <code>.btn-lg .btn-sm .btn-xs</code> to change
                            the style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button className="me-2" variant="primary btn-lg">
                              Large Button
                            </Button>
                            <Button className="me-2" variant="primary">
                              Default Button
                            </Button>
                            <Button className="me-2" variant="primary btn-sm">
                              Small Button
                            </Button>
                            <Button className="me-2" variant="primary btn-xs">
                              Extra Small Button
                            </Button>
                            <Button variant="primary btn-xxs">
                              Extra Small Button
                            </Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
    <div className="card-body">
      <Button className="me-2" variant="primary btn-lg">
        Large Button
      </Button>
      <Button className="me-2" variant="primary">
        Default Button
      </Button>
      <Button className="me-2" variant="primary btn-sm">
        Small Button
      </Button>
      <Button className="me-2" variant="primary btn-xs">
        Extra Small Button
      </Button>
      <Button variant="primary btn-xxs">Extra Small Button</Button>
      </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="button-size-icon">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Button Sizes Icon</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            add <code>.btn-lg .btn-sm .btn-xs</code> to change
                            the style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button
                              className="me-2"
                              variant="primary btn-icon-lg"
                            >
                              <i className="fa-solid fa-house-chimney" />
                            </Button>
                            <Button
                              className="me-2"
                              variant="primary btn-icon-md"
                            >
                              <i className="fa-solid fa-house-chimney" />
                            </Button>
                            <Button
                              className="me-2"
                              variant="primary btn-icon-sm"
                            >
                              <i className="fa-solid fa-house-chimney" />
                            </Button>
                            <Button
                              className="me-2"
                              variant="primary btn-icon-xs"
                            >
                              <i className="fa-solid fa-house-chimney" />
                            </Button>
                            <Button variant="primary btn-icon-xxs">
                              <i className="fa-solid fa-house-chimney" />
                            </Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
    <div className="card-body">
      <Button className="me-2" variant="primary btn-icon-lg">
        <i className="fa-solid fa-house-chimney" />
      </Button>
      <Button className="me-2" variant="primary btn-icon-md">
        <i className="fa-solid fa-house-chimney" />
      </Button>
      <Button className="me-2" variant="primary btn-icon-sm">
        <i className="fa-solid fa-house-chimney" />
      </Button>
      <Button className="me-2" variant="primary btn-icon-xs">
          <i className="fa-solid fa-house-chimney" />
      </Button>
      <Button variant="primary btn-icon-xxs"><i className="fa-solid fa-house-chimney" /></Button>
    </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="outline-button-sizes">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Outline Button Sizes</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            add <code>.btn-lg .btn-sm .btn-xs</code> to change
                            the style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button
                              className="me-2"
                              variant="outline-primary btn-lg"
                            >
                              Large button
                            </Button>
                            <Button className="me-2" variant="outline-primary">
                              Default button
                            </Button>
                            <Button
                              className="me-2"
                              variant="outline-primary btn-md"
                            >
                              Small button
                            </Button>
                            <Button
                              className="me-2"
                              variant="outline-primary btn-sm"
                            >
                              Small button
                            </Button>
                            <Button variant="outline-primary btn-xs">
                              Extra small button
                            </Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
    <div className="card-body">
      <Button className="me-2" variant="outline-primary btn-lg">
        Large button
      </Button>
      <Button className="me-2" variant="outline-primary">
        Default button
      </Button>
      <Button className="me-2" variant="outline-primary btn-md">
        Small button
      </Button>
      <Button className="me-2" variant="outline-primary btn-sm">
        Small button
      </Button>
      <Button variant="outline-primary btn-xs">
        Extra small button
      </Button>
    </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>                
               
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="button-right-icons">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Button Right icons</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            add <code>.btn-icon-end</code> to change the style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button className="me-2" variant="primary">
                              Add to cart{" "}
                              <span className="btn-icon-end">
                                <i className="fa fa-shopping-cart" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="info">
                              Add to wishlist{" "}
                              <span className="btn-icon-end">
                                <i className="fa fa-heart" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="danger">
                              Remove{" "}
                              <span className="btn-icon-end">
                                <i className="far fa-window-close" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="secondary">
                              Sent message{" "}
                              <span className="btn-icon-end">
                                <i className="fa fa-envelope" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="warning">
                              Add bookmark{" "}
                              <span className="btn-icon-end">
                                <i className="fa fa-star" />
                              </span>
                            </Button>
                            <Button variant="success">
                              Success{" "}
                              <span className="btn-icon-end">
                                <i className="fa fa-check" />
                              </span>
                            </Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
    <div className="card-body">
      <Button className="me-2" variant="primary">
        Add to cart{" "}
        <span className="btn-icon-end">
          <i className="fa fa-shopping-cart" />
        </span>
      </Button>
      <Button className="me-2" variant="info">
        Add to wishlist{" "}
        <span className="btn-icon-end">
          <i className="fa fa-heart" />
        </span>
      </Button>
      <Button className="me-2" variant="danger">
        Remove{" "}
        <span className="btn-icon-end">
          <i className="far fa-window-close" />
        </span>
      </Button>
      <Button className="me-2" variant="secondary">
        Sent message{" "}
        <span className="btn-icon-end">
          <i className="fa fa-envelope" />
        </span>
      </Button>
      <Button className="me-2" variant="warning">
        Add bookmark{" "}
        <span className="btn-icon-end">
          <i className="fa fa-star" />
        </span>
      </Button>
      <Button variant="success">
        Success{" "}
        <span className="btn-icon-end">
          <i className="fa fa-check" />
        </span>
      </Button>
    </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="button-left-icons">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Button Left icons</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            add <code>.btn-icon-start</code> to change the style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button className="me-2" variant="primary ">
                              <span className="btn-icon-start text-primary">
                                <i className="fa fa-shopping-cart" />
                              </span>
                              Buy
                            </Button>
                            <Button className="me-2" variant="info ">
                              <span className="btn-icon-start text-info">
                                <i className="fa fa-plus color-info" />
                              </span>
                              Add
                            </Button>
                            <Button className="me-2" variant="danger ">
                              <span className="btn-icon-start text-danger">
                                <i className="fa fa-envelope color-danger" />
                              </span>
                              Email
                            </Button>
                            <Button className="me-2" variant="secondary ">
                              <span className="btn-icon-start text-secondary">
                                <i className="fa fa-share-alt color-secondary" />{" "}
                              </span>
                              Share
                            </Button>
                            <Button className="me-2" variant="warning ">
                              <span className="btn-icon-start text-warning">
                                <i className="fa fa-download color-warning" />
                              </span>
                              Download
                            </Button>
                            <Button variant="success ">
                              <span className="btn-icon-start text-success">
                                <i className="fa fa-upload color-success" />
                              </span>
                              Upload
                            </Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
    <div className="card-body">
      <Button className="me-2" variant="primary ">
        <span className="btn-icon-start text-primary">
          <i className="fa fa-shopping-cart" />
        </span>
        Buy
      </Button>
      <Button className="me-2" variant="info ">
        <span className="btn-icon-start text-info">
          <i className="fa fa-plus color-info" />
        </span>
        Add
      </Button>
      <Button className="me-2" variant="danger ">
        <span className="btn-icon-start text-danger">
          <i className="fa fa-envelope color-danger" />
        </span>
        Email
      </Button>
      <Button className="me-2" variant="secondary ">
        <span className="btn-icon-start text-secondary">
          <i className="fa fa-share-alt color-secondary" />{" "}
        </span>
        Share
      </Button>
      <Button className="me-2" variant="warning ">
        <span className="btn-icon-start text-warning">
          <i className="fa fa-download color-warning" />
        </span>
        Download
      </Button>
      <Button variant="success">
        <span className="btn-icon-start text-success">
          <i className="fa fa-upload color-success" />
        </span>
        Upload
      </Button>
    </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="square-buttons">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Square Buttons</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            add <code>.btn-square</code> to change the style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button
                              className="me-2"
                              variant="primary btn-square"
                            >
                              Primary
                            </Button>
                            <Button
                              className="me-2"
                              variant="secondary btn-square"
                            >
                              Secondary
                            </Button>
                            <Button
                              className="me-2"
                              variant="success btn-square"
                            >
                              Success
                            </Button>
                            <Button
                              className="me-2"
                              variant="danger btn-square"
                            >
                              Danger
                            </Button>
                            <Button
                              className="me-2"
                              variant="warning btn-square"
                            >
                              Warning
                            </Button>
                            <Button className="me-2" variant="info btn-square">
                              Info
                            </Button>
                            <Button className="me-2" variant="light btn-square">
                              Light
                            </Button>
                            <Button variant="dark btn-square">Dark</Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
    <div className="card-body">
      <Button className="me-2" variant="primary btn-square">
        Primary
      </Button>
      <Button className="me-2" variant="secondary btn-square">
        Secondary
      </Button>
      <Button className="me-2" variant="success btn-square">
        Success
      </Button>
      <Button className="me-2" variant="danger btn-square">
        Danger
      </Button>
      <Button className="me-2" variant="warning btn-square">
        Warning
      </Button>
      <Button className="me-2" variant="info btn-square">
        Info
      </Button>
      <Button className="me-2" variant="light btn-square">
        Light
      </Button>
      <Button variant="dark btn-square">Dark</Button>
    </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="square-outline-buttons">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Square Outline Buttons</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            add <code>.btn-square</code> to change the style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button
                              className="me-2"
                              variant="outline-primary btn-square"
                            >
                              Primary
                            </Button>
                            <Button
                              className="me-2"
                              variant="outline-secondary btn-square"
                            >
                              Secondary
                            </Button>
                            <Button
                              className="me-2"
                              variant="outline-success btn-square"
                            >
                              Success
                            </Button>
                            <Button
                              className="me-2"
                              variant="outline-danger btn-square"
                            >
                              Danger
                            </Button>
                            <Button
                              className="me-2"
                              variant="outline-warning btn-square"
                            >
                              Warning
                            </Button>
                            <Button
                              className="me-2"
                              variant="outline-info btn-square"
                            >
                              Info
                            </Button>
                            <Button
                              className="me-2"
                              variant="outline-light btn-square"
                            >
                              Light
                            </Button>
                            <Button variant="outline-dark btn-square">
                              Dark
                            </Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
    <div className="card-body">
      <Button className="me-2" variant="outline-primary btn-square">
        Primary
      </Button>
      <Button className="me-2" variant="outline-secondary btn-square">
        Secondary
      </Button>
      <Button className="me-2" variant="outline-success btn-square">
        Success
      </Button>
      <Button className="me-2" variant="outline-danger btn-square">
        Danger
      </Button>
      <Button className="me-2" variant="outline-warning btn-square">
        Warning
      </Button>
      <Button className="me-2" variant="outline-info btn-square">
        Info
      </Button>
      <Button className="me-2" variant="outline-light btn-square">
        Light
      </Button>
      <Button variant="outline-dark btn-square">Dark</Button>
    </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="rounded-button">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Rounded Button</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            add <code>.btn-rounded</code> to change the style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button
                              className="me-2"
                              variant="primary btn-rounded"
                            >
                              Primary
                            </Button>
                            <Button
                              className="me-2"
                              variant="secondary btn-rounded"
                            >
                              Secondary
                            </Button>
                            <Button
                              className="me-2"
                              variant="success btn-rounded"
                            >
                              Success
                            </Button>
                            <Button
                              className="me-2"
                              variant="danger btn-rounded"
                            >
                              Danger
                            </Button>
                            <Button
                              className="me-2"
                              variant="warning btn-rounded"
                            >
                              Warning
                            </Button>
                            <Button className="me-2" variant="info btn-rounded">
                              Info
                            </Button>
                            <Button
                              className="me-2"
                              variant="light btn-rounded"
                            >
                              Light
                            </Button>
                            <Button variant="dark btn-rounded">Dark</Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
    <div className="card-body">
      <Button className="me-2" variant="primary btn-rounded">
        Primary
      </Button>
      <Button className="me-2" variant="secondary btn-rounded">
        Secondary
      </Button>
      <Button className="me-2" variant="success btn-rounded">
        Success
      </Button>
      <Button className="me-2" variant="danger btn-rounded">
        Danger
      </Button>
      <Button className="me-2" variant="warning btn-rounded">
        Warning
      </Button>
      <Button className="me-2" variant="info btn-rounded">
        Info
      </Button>
      <Button className="me-2" variant="light btn-rounded">
        Light
      </Button>
      <Button variant="dark btn-rounded">Dark</Button>
    </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="rounded-outline-buttons">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Rounded outline Buttons</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            add <code>.btn-rounded</code> to change the style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button
                              className="me-2"
                              variant="outline-primary btn-rounded"
                            >
                              Primary
                            </Button>
                            <Button
                              className="me-2"
                              variant="outline-secondary btn-rounded"
                            >
                              Secondary
                            </Button>
                            <Button
                              className="me-2"
                              variant="outline-success btn-rounded"
                            >
                              Success
                            </Button>
                            <Button
                              className="me-2"
                              variant="outline-danger btn-rounded"
                            >
                              Danger
                            </Button>
                            <Button
                              className="me-2"
                              variant="outline-warning btn-rounded"
                            >
                              Warning
                            </Button>
                            <Button
                              className="me-2"
                              variant="outline-info btn-rounded"
                            >
                              Info
                            </Button>
                            <Button
                              className="me-2"
                              variant="outline-light btn-rounded"
                            >
                              Light
                            </Button>
                            <Button variant="outline-dark btn-rounded">
                              Dark
                            </Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
    <div className="card-body">
      <Button className="me-2" variant="outline-primary btn-rounded">
        Primary
      </Button>
      <Button
        className="me-2"
        variant="outline-secondary btn-rounded"
      >
        Secondary
      </Button>
      <Button className="me-2" variant="outline-success btn-rounded">
        Success
      </Button>
      <Button className="me-2" variant="outline-danger btn-rounded">
        Danger
      </Button>
      <Button className="me-2" variant="outline-warning btn-rounded">
        Warning
      </Button>
      <Button className="me-2" variant="outline-info btn-rounded">
        Info
      </Button>
      <Button className="me-2" variant="outline-light btn-rounded">
        Light
      </Button>
      <Button variant="outline-dark btn-rounded">Dark</Button>
    </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="dropdown-button">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Dropdown Button</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            Default dropdown button style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <ButtonGroup>
                              <Dropdown>
                                <Dropdown.Toggle
                                  className="me-2"
                                  variant="primary"
                                >
                                  Primary
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item>Dropdown link</Dropdown.Item>
                                  <Dropdown.Item>Dropdown link</Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </ButtonGroup>
                            <ButtonGroup>
                              <Dropdown>
                                <Dropdown.Toggle
                                  className="me-2"
                                  variant="secondary"
                                >
                                  Secondary
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item>Dropdown link</Dropdown.Item>
                                  <Dropdown.Item>Dropdown link</Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </ButtonGroup>
                            <ButtonGroup>
                              <Dropdown>
                                <Dropdown.Toggle
                                  className="me-2"
                                  variant="success"
                                >
                                  Success
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item>Dropdown link</Dropdown.Item>
                                  <Dropdown.Item>Dropdown link</Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </ButtonGroup>
                            <ButtonGroup>
                              <Dropdown>
                                <Dropdown.Toggle
                                  className="me-2"
                                  variant="warning"
                                >
                                  Warning
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item>Dropdown link</Dropdown.Item>
                                  <Dropdown.Item>Dropdown link</Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </ButtonGroup>

                            <ButtonGroup>
                              <Dropdown>
                                <Dropdown.Toggle variant="danger">
                                  Danger
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item>Dropdown link</Dropdown.Item>
                                  <Dropdown.Item>Dropdown link</Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </ButtonGroup>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
      <div className="card-body">
      <ButtonGroup>
        <Dropdown>
          <Dropdown.Toggle className="me-2" variant="primary">
            Primary
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item >Dropdown link</Dropdown.Item>
            <Dropdown.Item >Dropdown link</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>
      <ButtonGroup>
        <Dropdown>
          <Dropdown.Toggle className="me-2" variant="secondary">
            Secondary
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item >Dropdown link</Dropdown.Item>
            <Dropdown.Item >Dropdown link</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>
      <ButtonGroup>
        <Dropdown>
          <Dropdown.Toggle className="me-2" variant="success">
            Success
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item >Dropdown link</Dropdown.Item>
            <Dropdown.Item >Dropdown link</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>
      <ButtonGroup>
        <Dropdown>
          <Dropdown.Toggle className="me-2" variant="warning">
            Warning
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item >Dropdown link</Dropdown.Item>
            <Dropdown.Item >Dropdown link</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>

      <ButtonGroup>
        <Dropdown>
          <Dropdown.Toggle variant="danger">Danger</Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item >Dropdown link</Dropdown.Item>
            <Dropdown.Item >Dropdown link</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </ButtonGroup>
    </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="buttons-transparent">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Buttons Transparent</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            Button transparent style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button variant="primary tp-btn">Primary</Button>
                            <Button variant="secondary tp-btn">
                              Secondary
                            </Button>
                            <Button variant="success tp-btn">Success</Button>
                            <Button variant="danger tp-btn">Danger</Button>
                            <Button variant="warning tp-btn">Warning</Button>
                            <Button variant="info tp-btn">Info</Button>
                            <Button variant="light tp-btn">Light</Button>
                            <Button variant="dark tp-btn">Dark</Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
    <div className="card-body">
      <Button variant="primary tp-btn">Primary</Button>
      <Button variant="secondary tp-btn">Secondary</Button>
      <Button variant="success tp-btn">Success</Button>
      <Button variant="danger tp-btn">Danger</Button>
      <Button variant="warning tp-btn">Warning</Button>
      <Button variant="info tp-btn">Info</Button>
      <Button variant="light tp-btn">Light</Button>
      <Button variant="dark tp-btn">Dark</Button>
    </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="buttons-transparent-light">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Buttons Transparent Light</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            Button transparent light style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button variant="primary tp-btn-light">
                              Primary
                            </Button>
                            <Button variant="secondary tp-btn-light">
                              Secondary
                            </Button>
                            <Button variant="success tp-btn-light">
                              Success
                            </Button>
                            <Button variant="danger tp-btn-light">
                              Danger
                            </Button>
                            <Button variant="warning tp-btn-light">
                              Warning
                            </Button>
                            <Button variant="info tp-btn-light">Info</Button>
                            <Button variant="tp-btn-light text-black">
                              Light
                            </Button>
                            <Button variant="dark tp-btn-light">Dark</Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
    <div className="card-body">
      <Button variant="primary tp-btn-light">Primary</Button>
      <Button variant="secondary tp-btn-light">Secondary</Button>
      <Button variant="success tp-btn-light">Success</Button>
      <Button variant="danger tp-btn-light">Danger</Button>
      <Button variant="warning tp-btn-light">Warning</Button>
      <Button variant="info tp-btn-light">Info</Button>
      <Button variant="tp-btn-light text-black">Light</Button>
      <Button variant="dark tp-btn-light">Dark</Button>
    </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="disabled-button">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Disabled Button</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            add <code>disabled</code> to change the style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button
                              className="me-2"
                              variant="primary btn-rounded"
                              disabled
                            >
                              Primary
                            </Button>
                            <Button
                              className="me-2"
                              variant="secondary btn-rounded"
                              disabled
                            >
                              Secondary
                            </Button>
                            <Button
                              className="me-2"
                              variant="success btn-rounded"
                              disabled
                            >
                              Success
                            </Button>
                            <Button
                              className="me-2"
                              variant="danger btn-rounded"
                              disabled
                            >
                              Danger
                            </Button>
                            <Button
                              className="me-2"
                              variant="warning btn-rounded"
                              disabled
                            >
                              Warning
                            </Button>
                            <Button variant="info btn-rounded" disabled>
                              Info
                            </Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
    <div className="card-body">
      <Button
        className="me-2"
        variant="primary btn-rounded"
        disabled
      >
        Primary
      </Button>
      <Button
        className="me-2"
        variant="secondary btn-rounded"
        disabled
      >
        Secondary
      </Button>
      <Button
        className="me-2"
        variant="success btn-rounded"
        disabled
      >
        Success
      </Button>
      <Button
        className="me-2"
        variant="danger btn-rounded"
        disabled
      >
        Danger
      </Button>
      <Button
        className="me-2"
        variant="warning btn-rounded"
        disabled
      >
        Warning
      </Button>
      <Button variant="info btn-rounded" disabled>
        Info
      </Button>
    </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>
                <Col lg="12">
                  <Tab.Container defaultActiveKey="Preview">
                    <Card className="dz-card" id="socia-icon-buttons">
                      <Card.Header className="d-flex justify-content-between flex-wrap">
                        <div>
                          <Card.Title>Socia icon Buttons with Name</Card.Title>
                          <Card.Text className="mb-0 subtitle">
                            add{" "}
                            <code>
                              .btn-facebook, .btn-twitter, .btn-youtube...
                            </code>{" "}
                            to change the style
                          </Card.Text>
                        </div>
                        <Nav
                          as="ul"
                          className="nav nav-tabs dzm-tabs"
                          id="myTab"
                          role="tablist"
                        >
                          <Nav.Item
                            as="li"
                            className="nav-item"
                            role="presentation"
                          >
                            <Nav.Link
                              as="button"
                              type="button"
                              eventKey="Preview"
                            >
                              Preview
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item as="li" className="nav-item">
                            <Nav.Link as="button" type="button" eventKey="Code">
                              React
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Header>
                      <Tab.Content>
                        <Tab.Pane eventKey="Preview">
                          <div className="card-body">
                            <Button className="me-2" variant="facebook">
                              Facebook
                              <span className="btn-icon-end">
                                <i className="fab fa-facebook-f" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="twitter">
                              Twitter
                              <span className="btn-icon-end">
                                <i className="fab fa-twitter" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="youtube">
                              Youtube
                              <span className="btn-icon-end">
                                <i className="fab fa-youtube" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="instagram">
                              Instagram
                              <span className="btn-icon-end">
                                <i className="fab fa-instagram" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="pinterest">
                              Pinterest
                              <span className="btn-icon-end">
                                <i className="fab fa-pinterest-square" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="linkedin">
                              Linkedin
                              <span className="btn-icon-end">
                                <i className="fab fa-linkedin-in" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="google-plus">
                              Google +
                              <span className="btn-icon-end">
                                <i className="fab fa-google-plus-g" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="google">
                              Google
                              <span className="btn-icon-end">
                                <i className="fab fa-google" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="snapchat">
                              Snapchat
                              <span className="btn-icon-end">
                                <i className="fab fa-snapchat" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="whatsapp">
                              Whatsapp
                              <span className="btn-icon-end">
                                <i className="fab fa-whatsapp" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="tumblr">
                              Tumblr
                              <span className="btn-icon-end">
                                <i className="fab fa-tumblr" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="reddit">
                              Reddit
                              <span className="btn-icon-end">
                                <i className="fab fa-reddit" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="spotify">
                              Spotify
                              <span className="btn-icon-end">
                                <i className="fab fa-spotify" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="yahoo">
                              Yahoo
                              <span className="btn-icon-end">
                                <i className="fab fa-yahoo" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="dribbble">
                              Dribbble
                              <span className="btn-icon-end">
                                <i className="fab fa-dribbble" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="skype">
                              Skype
                              <span className="btn-icon-end">
                                <i className="fab fa-skype" />
                              </span>
                            </Button>
                            <Button className="me-2" variant="quora">
                              Quora
                              <span className="btn-icon-end">
                                <i className="fab fa-quora" />
                              </span>
                            </Button>
                            <Button variant="vimeo">
                              Vimeo
                              <span className="btn-icon-end">
                                <i className="fab fa-vimeo-v" />
                              </span>
                            </Button>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="Code">
                          <div className="card-body pt-0 p-0 code-area">
                            <pre className="mb-0">
                              <code className="language-html">
                                <Highlight>
                                  {`
      <div className="card-body">
      <Button className="me-2" variant="facebook">
        Facebook{" "}
        <span className="btn-icon-end">
          <i className="fab fa-facebook-f" />
        </span>
      </Button>
      <Button className="me-2" variant="twitter">
        Twitter{" "}
        <span className="btn-icon-end">
          <i className="fab fa-twitter" />
        </span>
      </Button>
      <Button className="me-2" variant="youtube">
        Youtube{" "}
        <span className="btn-icon-end">
          <i className="fab fa-youtube" />
        </span>
      </Button>
      <Button className="me-2" variant="instagram">
        Instagram{" "}
        <span className="btn-icon-end">
          <i className="fab fa-instagram" />
        </span>
      </Button>
      <Button className="me-2" variant="pinterest">
        Pinterest{" "}
        <span className="btn-icon-end">
          <i className="fab fa-pinterest-square" />
        </span>
      </Button>
      <Button className="me-2" variant="linkedin">
        Linkedin{" "}
        <span className="btn-icon-end">
          <i className="fab fa-linkedin-in" />
        </span>
      </Button>
      <Button className="me-2" variant="google-plus">
        Google +{" "}
        <span className="btn-icon-end">
          <i className="fab fa-google-plus-g" />
        </span>
      </Button>
      <Button className="me-2" variant="google">
        Google{" "}
        <span className="btn-icon-end">
          <i className="fab fa-google" />
        </span>
      </Button>
      <Button className="me-2" variant="snapchat">
        Snapchat{" "}
        <span className="btn-icon-end">
          <i className="fab fa-snapchat" />
        </span>
      </Button>
      <Button className="me-2" variant="whatsapp">
        Whatsapp{" "}
        <span className="btn-icon-end">
          <i className="fab fa-whatsapp" />
        </span>
      </Button>
      <Button className="me-2" variant="tumblr">
        Tumblr{" "}
        <span className="btn-icon-end">
          <i className="fab fa-tumblr" />
        </span>
      </Button>
      <Button className="me-2" variant="reddit">
        Reddit{" "}
        <span className="btn-icon-end">
          <i className="fab fa-reddit" />
        </span>
      </Button>
      <Button className="me-2" variant="spotify">
        Spotify{" "}
        <span className="btn-icon-end">
          <i className="fab fa-spotify" />
        </span>
      </Button>
      <Button className="me-2" variant="yahoo">
        Yahoo{" "}
        <span className="btn-icon-end">
          <i className="fab fa-yahoo" />
        </span>
      </Button>
      <Button className="me-2" variant="dribbble">
        Dribbble{" "}
        <span className="btn-icon-end">
          <i className="fab fa-dribbble" />
        </span>
      </Button>
      <Button className="me-2" variant="skype">
        Skype{" "}
        <span className="btn-icon-end">
          <i className="fab fa-skype" />
        </span>
      </Button>
      <Button className="me-2" variant="quora">
        Quora{" "}
        <span className="btn-icon-end">
          <i className="fab fa-quora" />
        </span>
      </Button>
      <Button variant="vimeo">
        Vimeo{" "}
        <span className="btn-icon-end">
          <i className="fab fa-vimeo-v" />
        </span>
      </Button>
    </div>
    `}
                                </Highlight>
                              </code>
                            </pre>
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Card>
                  </Tab.Container>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <div className="demo-right ">
          <div className="demo-right-inner dlab-scroll " id="right-sidebar">
            <h4 className="title">Examples For Button</h4>
            <ul className="navbar-nav" id="menu-bar">
              {sidebarLink.map((item, ind) => (
                <li key={ind}>
                  <Link
                    to={item.to}
                    className={`scroll ${ind === activeLink ? "active" : ""} `}
                    activeClass="active"
                    spy={true}
                    smooth={true}
                    onClick={() => setActiveLink(ind)}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default UiButton;
