type NavButtonProps = {
    name: string;
    icon: string;
    path: string;
};

import "./NavButton.scss";

import { Link } from "react-router-dom";

export default function NavButton({ name, icon, path }: NavButtonProps) {
    return (
        <Link to={path} className="nav-button">
            <i className={icon}></i>
            <span>{name}</span>
        </Link>
    );
}
