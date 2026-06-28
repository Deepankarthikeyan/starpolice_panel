import { Fragment, useState } from "react";
import SideBar from "./SideBar";
import NavHader from "./NavHader";
import Header from "./Header";
import ChatBox from "../ChatBox";

interface propType {
  title?: string;
  onClick?: () => void;
}

const NavBlog = ({ title, onClick: ClickToAddEvent }: propType) => {
  const [toggle, setToggle] = useState<string>();
  const onClick = (name: string) => setToggle(toggle === name ? "" : name);
  return (
    <Fragment>
      <NavHader />
      <ChatBox onClick={() => onClick("chatbox")} toggle={toggle} />
      <Header
        onNote={() => onClick("chatbox")}
        onNotification={() => onClick("notification")}
        onProfile={() => onClick("profile")}
        toggle={toggle}
        title={title}
        onBox={() => onClick("box")}
        onClick={() => ClickToAddEvent}
      />
      <SideBar />
    </Fragment>
  );
};

export default NavBlog;
