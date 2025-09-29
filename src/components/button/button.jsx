import { Link } from "react-router-dom";
import "../../styles/style-button.css";

export default function FancyButton({ to = "#", text = "Click Me" }) {
  return (
    <Link to={to} className="fancy">
      <span className="top-key"></span>
      <span className="text">{text}</span>
      <span className="bottom-key-1"></span>
      <span className="bottom-key-2"></span>
    </Link>
  );
}
