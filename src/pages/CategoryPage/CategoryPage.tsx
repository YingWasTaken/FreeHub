import "./CategoryPage.scss";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ResourceList from "../../components/ResourceList/ResourceList";
import type { SearchableAsset } from "../../lib/catalog";
import {
    findCategory,
    formatCount,
    loadCategory,
    searchAssets,
} from "../../lib/catalog";

const VISIBLE_SECTIONS = 10;

export default function CategoryPage() {
    const { category } = useParams<{ category: string }>();
    const currentCategory = findCategory(category);
    const [params, setParams] = useSearchParams();
    const [assets, setAssets] = useState<SearchableAsset[] | null>(null);
    const [allSections, setAllSections] = useState<boolean>(false);

    const query = params.get("q") ?? "";
    const section = params.get("section") ?? "";

    useEffect(() => {
        if (!currentCategory) return;
        let active = true;
        setAssets(null);
        setAllSections(false);
        loadCategory(currentCategory).then((loaded) => {
            if (active) setAssets(loaded);
        });
        return () => {
            active = false;
        };
    }, [currentCategory]);

    const sections = useMemo(() => {
        const counts = new Map<string, number>();
        for (const asset of assets ?? []) {
            counts.set(asset.section, (counts.get(asset.section) ?? 0) + 1);
        }
        return [...counts].sort((a, b) => b[1] - a[1]);
    }, [assets]);

    const results = useMemo(() => {
        const inSection = section
            ? (assets ?? []).filter((asset) => asset.section === section)
            : (assets ?? []);
        return searchAssets(inSection, query);
    }, [assets, query, section]);

    const updateParam = (key: string, value: string): void => {
        setParams(
            (previous) => {
                const next = new URLSearchParams(previous);
                if (value) next.set(key, value);
                else next.delete(key);
                return next;
            },
            { replace: true }
        );
    };

    if (!currentCategory) {
        return (
            <section className="category-page">
                <h1 className="page-title">Category not found</h1>
                <p>
                    <Link to="/">Back to all categories</Link>
                </p>
            </section>
        );
    }

    // The active section stays visible even when the list is collapsed.
    const shownSections =
        allSections || sections.length <= VISIBLE_SECTIONS + 2
            ? sections
            : sections.filter(
                  ([name], index) =>
                      index < VISIBLE_SECTIONS || name === section
              );

    return (
        <section className="category-page">
            <header className="category-header">
                <h1 className="page-title">{currentCategory.name}</h1>
                <p>
                    <strong>{formatCount(currentCategory.count)}</strong>{" "}
                    {currentCategory.description}
                </p>
            </header>

            <input
                className="field"
                type="search"
                value={query}
                onChange={(event) => updateParam("q", event.target.value)}
                placeholder={`Filter ${currentCategory.name}...`}
                aria-label={`Filter ${currentCategory.name}`}
            />

            {sections.length > 1 && (
                <div className="section-filter" aria-label="Sections">
                    <button
                        type="button"
                        className={section ? "" : "active"}
                        aria-pressed={!section}
                        onClick={() => updateParam("section", "")}
                    >
                        All
                    </button>
                    {shownSections.map(([name, count]) => (
                        <button
                            key={name}
                            type="button"
                            className={section === name ? "active" : ""}
                            aria-pressed={section === name}
                            onClick={() => updateParam("section", name)}
                        >
                            {name} <small>{formatCount(count)}</small>
                        </button>
                    ))}
                    {shownSections.length < sections.length && (
                        <button
                            type="button"
                            className="section-more"
                            onClick={() => setAllSections(true)}
                        >
                            {sections.length - shownSections.length} more
                        </button>
                    )}
                </div>
            )}

            {assets && results.length === 0 ? (
                <p className="empty">Nothing matches that filter.</p>
            ) : (
                <ResourceList assets={results} />
            )}
        </section>
    );
}
