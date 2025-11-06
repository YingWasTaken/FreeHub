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
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setCategories(categoriesData);
    }, []);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                FreeHub
            </Link>

            {/* Botón de hamburguesa */}
            <div
                className={`navbar-hamburger ${menuOpen ? "open" : ""}`}
                onClick={toggleMenu}
            >
                <span></span>
                <span></span>
                <span></span>
            </div>

            {/* Links de navegación */}
            <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
                {categories.map((cat) => (
                    <NavButton
                        key={cat.id}
                        name={cat.name}
                        icon={cat.icon}
                        path={`/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={() => setMenuOpen(false)} // cerrar menú al hacer click
                    />
                ))}
            </div>
        </nav>
    );
}
