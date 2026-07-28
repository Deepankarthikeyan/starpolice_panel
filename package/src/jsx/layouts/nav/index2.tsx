import { Fragment, useState } from "react";
import SideBar from "./SideBar";
import Header from "./Header2";
import ChatBox from "../ChatBox";

const NavBlog = () =>
  // { title, onClick: ClickToAddEvent }
  {
    const [toggle, setToggle] = useState<string>();
    const onClick = (name: string) => setToggle(toggle === name ? "" : name);
    return (
      <Fragment>
        <ChatBox onClick={() => onClick("chatbox")} toggle={toggle} />
        <Header onNote={() => onClick("chatbox")} />
        <SideBar />
      </Fragment>
    );
  };

export default NavBlog;
