import "./SearchPage.scss";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ResourceList from "../../components/ResourceList/ResourceList";
import type { SearchableAsset } from "../../lib/catalog";
import {
    formatCount,
    loadEverything,
    searchAssets,
    totalResources,
} from "../../lib/catalog";

export default function SearchPage() {
    const [params, setParams] = useSearchParams();
    const [assets, setAssets] = useState<SearchableAsset[] | null>(null);
    const query = params.get("q") ?? "";

    useEffect(() => {
        let active = true;
        loadEverything().then((loaded) => {
            if (active) setAssets(loaded);
        });
        return () => {
            active = false;
        };
    }, []);

    const results = useMemo(
        () => (query.trim() ? searchAssets(assets ?? [], query) : []),
        [assets, query]
    );

    const summary = (): string => {
        if (!query.trim()) {
            return `Search across ${formatCount(totalResources)} resources.`;
        }
        if (!assets) return "Loading...";
        const label = results.length === 1 ? "result" : "results";
        return `${formatCount(results.length)} ${label}`;
    };

    return (
        <section className="search-page">
            <h1 className="page-title">Search</h1>
            <input
                className="field"
                type="search"
                value={query}
                autoFocus
                onChange={(event) =>
                    setParams(
                        event.target.value ? { q: event.target.value } : {},
                        { replace: true }
                    )
                }
                placeholder="Search fonts, icons, APIs..."
                aria-label="Search all resources"
            />
            <p className="search-summary" role="status">
                {summary()}
            </p>
            <ResourceList assets={results} showCategory />
        </section>
    );
}
