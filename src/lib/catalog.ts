import categoriesJson from "../assets/db/categories.json";

export type Category = {
    id: number;
    name: string;
    icon: string;
    description: string;
    count: number;
};

export type Asset = {
    id: number;
    title: string;
    description: string;
    url: string;
    section: string;
    tags?: string[];
    pick?: boolean;
};

export type SearchableAsset = Asset & {
    categorySlug: string;
    categoryName: string;
    haystack: string;
    titleKey: string;
};

export const categories: Category[] = categoriesJson;

export const totalResources = categories.reduce(
    (total, category) => total + category.count,
    0
);

export const categorySlug = (name: string): string =>
    name.toLowerCase().replace(/\s+/g, "-");

export const findCategory = (slug?: string): Category | undefined =>
    categories.find((category) => categorySlug(category.name) === slug);

export const formatCount = (count: number): string =>
    count.toLocaleString("en-US");

export function hostOf(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}

const loaders = import.meta.glob<{ default: Asset[] }>(
    "../assets/db/assets-*.json"
);

const cache = new Map<string, Promise<SearchableAsset[]>>();

export function loadCategory(category: Category): Promise<SearchableAsset[]> {
    const slug = categorySlug(category.name);
    const cached = cache.get(slug);
    if (cached) return cached;

    const pending = loaders[`../assets/db/assets-${slug}.json`]().then(
        (module) =>
            module.default.map((asset) => ({
                ...asset,
                categorySlug: slug,
                categoryName: category.name,
                titleKey: asset.title.toLowerCase(),
                haystack: [
                    asset.title,
                    asset.description,
                    asset.section,
                    category.name,
                    hostOf(asset.url),
                    ...(asset.tags ?? []),
                ]
                    .join(" ")
                    .toLowerCase(),
            }))
    );
    cache.set(slug, pending);
    return pending;
}

export async function loadEverything(): Promise<SearchableAsset[]> {
    const lists = await Promise.all(categories.map(loadCategory));
    return lists.flat();
}

// Every word must match. Title matches are listed first.
export function searchAssets(
    assets: SearchableAsset[],
    query: string
): SearchableAsset[] {
    const needle = query.trim().toLowerCase();
    if (!needle) return assets;

    const words = needle.split(/\s+/);
    const score = (asset: SearchableAsset): number => {
        if (asset.titleKey === needle) return 0;
        if (asset.titleKey.startsWith(needle)) return 1;
        if (asset.titleKey.includes(needle)) return 2;
        return asset.pick ? 3 : 4;
    };

    return assets
        .filter((asset) => words.every((word) => asset.haystack.includes(word)))
        .map((asset) => ({ asset, rank: score(asset) }))
        .sort((a, b) => a.rank - b.rank)
        .map(({ asset }) => asset);
}
