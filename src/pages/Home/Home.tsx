import "./Home.scss";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    categories,
    categorySlug,
    formatCount,
    totalResources,
} from "../../lib/catalog";

export default function Home() {
    const [query, setQuery] = useState<string>("");
    const navigate = useNavigate();

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    };

    return (
        <section className="home">
            <div className="hero">
                <h1 className="page-title">
                    Free resources for developers.
                </h1>
                <p>
                    {formatCount(totalResources)} assets, tools, and APIs you can
                    use for free, all in one place.
                </p>
                <form onSubmit={handleSubmit} role="search">
                    <input
                        className="field"
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search fonts, icons, APIs..."
                        aria-label="Search all resources"
                    />
                    <button type="submit">Search</button>
                </form>
            </div>

            <ul className="category-index">
                {categories.map((category) => (
                    <li key={category.id}>
                        <Link to={`/${categorySlug(category.name)}`}>
                            <h2>{category.name}</h2>
                            <strong>{formatCount(category.count)}</strong>
                            <p>{category.description}</p>
                        </Link>
                    </li>
                ))}
            </ul>

            <a
                className="home-licenses"
                href={`${import.meta.env.BASE_URL}third-party-notices.txt`}
                target="_blank"
                rel="noopener noreferrer"
            >
                Licenses
            </a>
        </section>
    );
}
