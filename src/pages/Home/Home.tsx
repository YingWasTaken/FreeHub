import "./Home.scss";
import { useEffect, useState } from "react";
import categoriesJson from "../../assets/db/categories.json";

type Category = {
    id: number;
    name: string;
    icon: string;
    description: string;
};

const categories: Category[] = categoriesJson;

export default function Home() {
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % categories.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const currentCategory: Category = categories[currentIndex];

    return (
        <section className="home">
            <div className="hero">
                <h1>
                    Discover all the <span>free resources</span> in one place.
                </h1>
                <p>
                    FreeHub brings together assets, tools, and open-source
                    resources for designers and developers.
                </p>
            </div>

            <div className="category-showcase">
                <div className="category-container fade">
                    <i className={`${currentCategory.icon} category-icon`}></i>
                    <h2>{currentCategory.name}</h2>
                    <p>{currentCategory.description}</p>
                </div>
            </div>

            <div className="about">
                <h3>Your free creative hub</h3>
                <p>
                    FreeHub gathers websites, tools, and free libraries to speed
                    up your creative workflow. From icons and fonts to textures,
                    sounds, and 3D models — everything organized, accessible,
                    and constantly growing.
                </p>
            </div>
        </section>
    );
}
