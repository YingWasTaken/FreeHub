import "./Navbar.scss";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import categoriesData from "../../assets/db/categories.json";
import NavButton from "../NavButton/NavButton";

type Category = {
    id: number;
    name: string;
    icon: string;
    description: string;
};

export default function Navbar() {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        setCategories(categoriesData);
    }, []);

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                FreeHub
            </Link>
            <div className="navbar-links">
                {categories.map((cat) => (
                    <NavButton
                        key={cat.id}
                        name={cat.name}
                        icon={cat.icon}
                        path={`/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                    />
                ))}
            </div>
        </nav>
    );
}
