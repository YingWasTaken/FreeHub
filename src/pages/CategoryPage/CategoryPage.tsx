import "./CategoryPage.scss";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import categoriesJson from "../../assets/db/categories.json";

type Category = {
    id: number;
    name: string;
    icon: string;
    description: string;
};

type Asset = {
    id: number;
    title: string;
    description: string;
    img: string;
    url: string;
    tags?: string[];
};

const categories: Category[] = categoriesJson;

export default function CategoryPage() {
    const { category } = useParams<{ category: string }>();
    const [currentCategory, setCurrentCategory] = useState<Category | null>(
        null
    );
    const [assets, setAssets] = useState<Asset[]>([]);

    useEffect(() => {
        const found = categories.find(
            (c) => c.name.toLowerCase().replace(/\s+/g, "-") === category
        );
        setCurrentCategory(found || null);

        import(`../../assets/db/assets-${category}.json`)
            .then((module) => setAssets(module.default as Asset[]))
            .catch(() => setAssets([]));
    }, [category]);

    if (!currentCategory)
        return (
            <div className="category-page">
                <h1>Categoría no encontrada</h1>
            </div>
        );

    return (
        <section className="category-page">
            <header className="category-header">
                <i className={`${currentCategory.icon} category-icon`}></i>
                <h1>{currentCategory.name}</h1>
                <p>{currentCategory.description}</p>
            </header>

            <div className="asset-grid">
                {assets.length === 0 ? (
                    <p className="empty">No resources available yet.</p>
                ) : (
                    assets.map((asset) => (
                        <a
                            key={asset.id}
                            href={asset.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="asset-card"
                        >
                            <img src={asset.img} alt={asset.title} />
                            <div className="asset-info">
                                <h3>{asset.title}</h3>
                                <p>{asset.description}</p>

                                {asset.tags && asset.tags.length > 0 && (
                                    <div className="asset-tags">
                                        {asset.tags.map((tag, i) => (
                                            <span key={i} className="tag">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="asset-footer">
                                    <span className="visit-btn">Visit →</span>
                                </div>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </section>
    );
}
