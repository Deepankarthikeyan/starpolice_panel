import { Fragment, useState } from "react";
import SideBar from "./SideBar";
import NavHader from "./NavHader";
import Header from "./Header2";
import ChatBox from "../ChatBox";

const NavBlog = () =>
  // { title, onClick: ClickToAddEvent }
  {
    const [toggle, setToggle] = useState<string>();
    const onClick = (name: string) => setToggle(toggle === name ? "" : name);
    return (
      <Fragment>
        <NavHader />
        <ChatBox onClick={() => onClick("chatbox")} toggle={toggle} />
        <Header onNote={() => onClick("chatbox")} />
        <SideBar />
      </Fragment>
    );
  };

export default NavBlog;
