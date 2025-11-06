import "./Navbar.scss";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import categoriesData from "../../assets/db/categories.json";
import NavButton from "../NavButton/NavButton";

interface Category {
    id: number;
    name: string;
    icon: string;
    description: string;
}

export default function Navbar(): ReactElement {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    useEffect(() => {
        setCategories(categoriesData as Category[]);
    }, []);

    const toggleMenu = (): void => {
        setMenuOpen((prev) => !prev);
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                FreeHub
            </Link>

            <div
                className={`navbar-hamburger ${menuOpen ? "open" : ""}`}
                onClick={toggleMenu}
                role="button"
                aria-label="Toggle menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
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
