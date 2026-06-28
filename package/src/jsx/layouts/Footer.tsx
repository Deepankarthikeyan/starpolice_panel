import { Link } from "react-router-dom";

interface propType {
  changeFooter: string;
}
const Footer = (props: propType) => {
  return (
    <div className={`footer ${props.changeFooter}`}>
      <div className="copyright">
        <p>
          Copyright © Designed &amp; Developed by{" "}
          <Link to="http://dexignlab.com/" target="_blank" rel="noreferrer">
            DexignLab
          </Link>{" "}
          {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Footer;
