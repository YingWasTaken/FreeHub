import "./ResourceList.scss";
import { useEffect, useRef, useState } from "react";
import type { SearchableAsset } from "../../lib/catalog";
import { hostOf } from "../../lib/catalog";

const PAGE_SIZE = 60;

type ResourceListProps = {
    assets: SearchableAsset[];
    showCategory?: boolean;
};

export default function ResourceList({
    assets,
    showCategory = false,
}: ResourceListProps) {
    const [visible, setVisible] = useState<number>(PAGE_SIZE);
    const sentinel = useRef<HTMLButtonElement>(null);
    const hasMore = visible < assets.length;

    useEffect(() => {
        setVisible(PAGE_SIZE);
    }, [assets]);

    useEffect(() => {
        const target = sentinel.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible((count) => count + PAGE_SIZE);
                }
            },
            { rootMargin: "600px" }
        );
        observer.observe(target);
        return () => observer.disconnect();
    }, [hasMore, visible]);

    return (
        <>
            <ul className="resource-list">
                {assets.slice(0, visible).map((asset) => (
                    <li key={`${asset.categorySlug}-${asset.id}`}>
                        <a
                            href={asset.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="resource"
                        >
                            <h3>{asset.title}</h3>
                            {asset.description && <p>{asset.description}</p>}
                            <div className="resource-meta">
                                <span className="resource-host">
                                    {hostOf(asset.url)}
                                </span>
                                {showCategory && (
                                    <span className="resource-tag">
                                        {asset.categoryName}
                                    </span>
                                )}
                                {asset.tags?.map((tag) => (
                                    <span key={tag} className="resource-tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </a>
                    </li>
                ))}
            </ul>

            {hasMore && (
                <button
                    ref={sentinel}
                    type="button"
                    className="resource-more"
                    onClick={() => setVisible((count) => count + PAGE_SIZE)}
                >
                    Show more
                </button>
            )}
        </>
    );
}
