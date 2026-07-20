import { Fragment, useState } from "react";
import SideBar from "./SideBar";
import NavHader from "./NavHader";
import Header from "./Header";
import ChatBox from "../ChatBox";
import type { PanelType } from "../../starPolice/types";

interface NavProps {
  basePath?: string;
  panel?: PanelType;
}

const NavBlog = ({ basePath = "/admin", panel = "admin" }: NavProps) => {
  const [toggle, setToggle] = useState<string>();
  const onClick = (name: string) => setToggle(toggle === name ? "" : name);
  return (
    <Fragment>
      <NavHader basePath={basePath} />
      <ChatBox onClick={() => onClick("chatbox")} toggle={toggle} />
      <Header onNote={() => onClick("chatbox")} toggle={toggle} />
      <SideBar basePath={basePath} panel={panel} />
    </Fragment>
  );
};

export default NavBlog;
