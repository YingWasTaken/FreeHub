import "./Sidebar.scss";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { categories, categorySlug, formatCount } from "../../lib/catalog";
import InfoButton from "../InfoButton/InfoButton";

export default function Sidebar(): ReactElement {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const { pathname } = useLocation();

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    return (
        <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
            <div className="sidebar-top">
                <Link to="/" className="sidebar-logo" aria-label="FreeHub home">
                    Free<span>hub</span>
                </Link>
                <button
                    type="button"
                    className="sidebar-toggle"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-expanded={menuOpen}
                    aria-controls="sidebar-menu"
                >
                    <i
                        className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`}
                    ></i>
                    {menuOpen ? "Close" : "Menu"}
                </button>
            </div>

            <div className="sidebar-menu" id="sidebar-menu">
                <nav aria-label="Categories">
                    <NavLink to="/search" className="sidebar-link">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <span>Search everything</span>
                    </NavLink>
                    {categories.map((category) => (
                        <NavLink
                            key={category.id}
                            to={`/${categorySlug(category.name)}`}
                            className="sidebar-link"
                        >
                            <i className={category.icon}></i>
                            <span>{category.name}</span>
                            <small>{formatCount(category.count)}</small>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <InfoButton />
                    <a
                        href="https://discord.gg/V2CShbdJP3"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Discord
                    </a>
                </div>
            </div>
        </aside>
    );
}
