// Builds src/assets/db/assets-*.json from data/manual.json and open lists.
//
//   npm run resources          rebuild the catalog
//   npm run resources:check    also test every link and drop the dead ones
//
// To add one resource by hand, add a line to data/manual.json and run the
// first command. Link results are cached in data/link-status.json.

import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dbFile = (name) => new URL(`src/assets/db/${name}`, root);
const dataFile = (name) => new URL(`data/${name}`, root);

const CATEGORIES = [
    ["Colors", "fa-solid fa-palette", "Palettes, gradients, and color tools."],
    ["Fonts", "fa-solid fa-font", "Open fonts and font tools."],
    ["Icons", "fa-solid fa-icons", "Icon sets, logos, and favicon tools."],
    ["Images", "fa-solid fa-image", "Stock photos, patterns, mockups, and archives."],
    ["Illustrations", "fa-solid fa-pen-nib", "Illustrations, vectors, and clip art."],
    ["Video", "fa-solid fa-film", "Stock footage and video tools."],
    ["Audio", "fa-solid fa-music", "Music, sound effects, and audio tools."],
    ["3D", "fa-solid fa-cube", "3D models, textures, HDRIs, and software."],
    ["UI Kits", "fa-solid fa-table-columns", "Components, CSS frameworks, and templates."],
    ["Inspiration", "fa-solid fa-lightbulb", "Galleries and design systems to learn from."],
    ["APIs", "fa-solid fa-code", "Public APIs for developers."],
    ["Tools", "fa-solid fa-screwdriver-wrench", "Tools for design and development."],
    ["Datasets", "fa-solid fa-database", "Open datasets for research, projects, and practice."],
    ["AI", "fa-solid fa-robot", "Open models and free AI tools."],
    ["Game Dev", "fa-solid fa-gamepad", "Engines, assets, and tools for making games."],
];

// Lists name the same thing differently, so sections are merged here.
const SECTION_ALIASES = {
    Colors: "Palettes",
    Fonts: "Font libraries",
    "Icon Fonts": "Icon fonts",
    "Icons Packages and Collections": "Icon sets",
    Videos: "Stock video",
    "Vector Graphics": "Vectors",
    Illustration: "Illustration packs",
    Textures: "Textures & HDRIs",
    Texture: "Textures & HDRIs",
    HDRIs: "Textures & HDRIs",
    "Aggregated Content": "Search engines",
    Sound: "Sound effects",
};

const slug = (name) => name.toLowerCase().replace(/\s+/g, "-");

const DESIGN_RESOURCES = {
    "UI Graphics": ["ui-kits", "UI graphics"],
    Fonts: ["fonts", "Font libraries"],
    Colors: ["colors", "Palettes"],
    Icons: ["icons", "Icon sets"],
    Logos: ["icons", "Logos"],
    Favicons: ["icons", "Favicons"],
    "Icon Fonts": ["icons", "Icon fonts"],
    "Stock Photos": ["images", "Stock photos"],
    "Stock Videos": ["video", "Stock video"],
    "Stock Music & Sound Effects": ["audio", "Music and sound effects"],
    "Vectors & Clip Art": ["illustrations", "Vectors"],
    "Product & Image Mockups": ["images", "Mockups"],
    "HTML & CSS Templates": ["ui-kits", "Templates"],
    "CSS Frameworks": ["ui-kits", "CSS frameworks"],
    "CSS Methodologies": ["ui-kits", "CSS methodologies"],
    "CSS Animations": ["ui-kits", "CSS animations"],
    "Javascript Animation Libraries": ["ui-kits", "JS animation"],
    "Javascript Chart Libraries": ["ui-kits", "Charts"],
    "UI Components & Kits": ["ui-kits", "Components"],
    "React UI Libraries": ["ui-kits", "React"],
    "Vue UI Libraries": ["ui-kits", "Vue"],
    "Angular UI Libraries": ["ui-kits", "Angular"],
    "Svelte UI Libraries": ["ui-kits", "Svelte"],
    "React Native UI Libraries": ["ui-kits", "React Native"],
    "Design Systems & Style Guides": ["inspiration", "Design systems"],
    "Online Design Tools": ["tools", "Design tools"],
    "Downloadable Design Software": ["tools", "Design software"],
    "Design Inspiration": ["inspiration", "Galleries"],
    "Image Compression": ["tools", "Image tools"],
    "Chrome Extensions": ["tools", "Browser extensions"],
    "Firefox Extensions": ["tools", "Browser extensions"],
    "AI Graphic Design Tools": ["ai", "Image"],
    Others: ["tools", "Other"],
};

const DESIGN_TOOLS = {
    "Color Picker Tools": ["colors", "Color pickers"],
    "Gradient Tools": ["colors", "Gradients"],
    "Font Tools": ["fonts", "Font tools"],
    "Icons Tools": ["icons", "Icon sets"],
    "Logo Design": ["icons", "Logos"],
    Illustrations: ["illustrations", "Illustration packs"],
    "Stock Photos Tools": ["images", "Stock photos"],
    "Mockup Tools": ["images", "Mockups"],
    "Stock Videos": ["video", "Stock video"],
    "Animation Tools": ["video", "Animation"],
    "Sound Design": ["audio", "Sound design"],
    "Three D Modeling Software": ["3d", "Software"],
    "Pixel Art Tools": ["game-dev", "Pixel art"],
    "Design Inspiration": ["inspiration", "Galleries"],
    "Design System Tools": ["inspiration", "Design systems"],
    "Tools for Learning Design": ["inspiration", "Learn design"],
    "Addendum (Reference & Inspiration)": null,
};

const STOCK = {
    Photography: "images",
    Illustration: "illustrations",
    "Vector Graphics": "illustrations",
    Videos: "video",
    Patterns: "images",
    Textures: "3d",
    Fonts: "fonts",
    Icons: "icons",
    Colors: "colors",
    "Aggregated Content": "images",
    "HTML Templates": "ui-kits",
};

const CC0 = { "3D models": "3d", Textures: "3d", Sound: "audio", ETC: "images" };

const EXTRA_SOURCES = [
    { name: "Fontsource", url: "https://fontsource.org/", license: "per font" },
    { name: "Iconify", url: "https://iconify.design/", license: "per icon set" },
];

const SOURCES = [
    {
        name: "Awesome Stock Resources",
        repo: "neutraltone/awesome-stock-resources",
        path: "master/README.md",
        license: "CC0-1.0",
        map({ h2, h3 }) {
            const category = STOCK[h2];
            if (!category) return null;
            if (h2 === "Photography") {
                return { category, section: "Stock photos", tags: [h3.replace(/-license$| licenses?$/i, "")] };
            }
            return { category, section: h3 || h2 };
        },
    },
    {
        name: "Design Resources for Developers",
        repo: "bradtraversy/design-resources-for-developers",
        path: "master/readme.md",
        license: "MIT",
        copyright: "Copyright (c) 2020 Brad Traversy",
        map({ h2 }) {
            const hit = DESIGN_RESOURCES[h2];
            return hit && { category: hit[0], section: hit[1] };
        },
    },
    {
        name: "Awesome Design Tools",
        repo: "goabstract/Awesome-Design-Tools",
        path: "master/README.md",
        license: "MIT",
        copyright: "Copyright (c) 2019 Lisa Dziuba",
        map({ h3, line }) {
            if (!h3 || !line.includes("free.svg")) return null; // The list also has paid tools.
            if (h3 in DESIGN_TOOLS) {
                const hit = DESIGN_TOOLS[h3];
                return hit && { category: hit[0], section: hit[1] };
            }
            return { category: "tools", section: h3.replace(/ Tools?$| Software$/, "") };
        },
    },
    {
        name: "Awesome CC0",
        repo: "madjin/awesome-cc0",
        path: "main/README.md",
        license: "CC0-1.0",
        map({ h2 }) {
            const category = CC0[h2];
            return category && { category, section: h2 === "ETC" ? "CC0 collections" : h2, tags: ["CC0"] };
        },
    },
    {
        name: "Magic Tools",
        repo: "ellisonleao/magictools",
        path: "master/README.md",
        license: "MIT",
        copyright: "Copyright (c) 2022 Ellison",
        map({ h2, h3, h4, line }) {
            if (["Ads", "Table of Contents"].includes(h2) || ["Books", "Magazines"].includes(h3)) return null;
            const paid = line.includes(":moneybag:") && !line.includes(":free:") && !line.includes(":tada:");
            if (paid) return null;
            const tags = [];
            if (line.includes(":tada:")) tags.push("Open source");
            if (line.includes(":money_with_wings:")) tags.push("Partly free");
            if (h2 === "Audio" && h3 === "Collections") return { category: "audio", section: "Game audio", tags };
            return { category: "game-dev", section: h4 || h3 || h2, tags };
        },
    },
    {
        name: "Awesome Generative AI",
        repo: "steven2358/awesome-generative-ai",
        path: "main/README.md",
        license: "CC0-1.0",
        map({ h2, h3 }) {
            if (/contents|recommended reading|contribut|awesome|papers|learning|more lists/i.test(h2)) return null;
            if (/milestones|leaderboards|models|model libraries|image libraries/i.test(h3)) return null;
            return { category: "ai", section: h2, tags: ["Check pricing"] };
        },
    },
    {
        name: "Awesome Blender",
        repo: "agmmnn/awesome-blender",
        path: "master/README.md",
        license: "CC0-1.0",
        map({ h2, h3 }) {
            if (!h3) return null;
            if (h2 === "Add-ons") return { category: "3d", section: "Blender add-ons", tags: ["Check pricing"] };
            if (h2 === "Standalone") {
                return /sound/i.test(h3)
                    ? { category: "audio", section: "Sound design" }
                    : { category: "3d", section: "Software" };
            }
            if (h2 !== "Resources") return null;
            if (/sound|music/i.test(h3)) return { category: "audio", section: "Music and sound effects" };
            if (/textures|materials|hdri/i.test(h3)) return { category: "3d", section: "Textures & HDRIs" };
            if (/models|scenes|mocap|space/i.test(h3)) return { category: "3d", section: "3D models" };
            return { category: "3d", section: "Other" };
        },
    },
    {
        name: "Awesome Music Production",
        repo: "ad-si/awesome-music-production",
        path: "master/readme.md",
        license: "ISC",
        map({ h2, h3, line }) {
            if (/\$\s*$/.test(line.trim())) return null; // The list marks paid products with $.
            if (h2 === "Software") {
                return { category: "audio", section: /libraries|live coding/i.test(h3) ? "Libraries" : "Software" };
            }
            if (h3 === "Sound / Sample Providers") return { category: "audio", section: "Samples" };
            if (h3 === "AI Music Creation") return { category: "audio", section: "AI music", tags: ["Check pricing"] };
            return null;
        },
    },
    {
        name: "Awesome Video",
        repo: "krzemienski/awesome-video",
        path: "master/README.md",
        license: "CC0-1.0",
        map({ h2 }) {
            if (!h2 || /contents|learning|contribut|license|community/i.test(h2)) return null;
            return { category: "video", section: h2 };
        },
    },
    {
        name: "Awesome Pixel Art",
        repo: "Siilwyn/awesome-pixel-art",
        path: "master/readme.md",
        license: "CC0-1.0",
        map({ h2 }) {
            return h2 === "Tools" ? { category: "game-dev", section: "Pixel art" } : null;
        },
    },
    {
        name: "Awesome Public Datasets",
        repo: "awesomedata/awesome-public-datasets",
        path: "master/README.rst",
        license: "MIT",
        copyright: "Copyright (c) 2014-2015 Xiaming Chen and other contributors to this list",
        format: "rst",
    },
    {
        name: "Public APIs",
        repo: "public-apis/public-apis",
        path: "master/README.md",
        license: "MIT",
        copyright: "Copyright (c) 2022 public-apis",
        map({ h2, h3, line }) {
            // Rows before "## Index" are sponsored placements.
            if (h2 !== "Index" || !h3) return null;
            const cells = line.split("|").map((cell) => cell.trim());
            const auth = cells[3]?.replace(/`/g, "");
            const tags = [auth === "No" ? "No auth" : auth === "apiKey" ? "API key" : auth];
            if (cells[5] === "Yes") tags.push("CORS");
            return { category: "apis", section: h3, tags: tags.filter(Boolean) };
        },
    },
];

function cleanUrl(raw) {
    const url = new URL(raw);
    for (const key of [...url.searchParams.keys()]) {
        if (/^(utm_|ref$)/.test(key)) url.searchParams.delete(key);
    }
    return url.href;
}

function urlKey(raw) {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    return `${host}${url.pathname.replace(/\/+$/, "")}${url.search}`;
}

function cleanText(text) {
    let out = text
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/:[a-z0-9_+-]+:/g, " ")
        .replace(/[\p{Extended_Pictographic}\p{Emoji_Modifier}\u200d\ufe0f]/gu, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/[`*_]{1,2}/g, "")
        .replace(/\s+/g, " ")
        .replace(/^[\s|:–—-]+/, "")
        .replace(/[\s|–—-]+$/, "")
        .trim();
    if (out.length > 220) out = `${out.slice(0, 217).replace(/\s+\S*$/, "")}...`;
    return out ? out[0].toUpperCase() + out.slice(1) : out;
}

function parseRst(text, source) {
    const rows = [];
    let section = "";
    const lines = text.split("\n");
    lines.forEach((line, i) => {
        if (/^-{3,}\s*$/.test(lines[i + 1] ?? "") && line.trim()) section = cleanText(line.replace(/([a-z])([A-Z])/g, "$1 $2"));
        // FIXME rows are the ones the list itself marks as broken.
        const row = line.match(/^\* \|OK_ICON\| `(.+?)\s*<(https?:\/\/[^>]+)>`_/);
        if (!row) return;
        const [title, ...rest] = row[1].split(" - ");
        rows.push({
            title: cleanText(title),
            url: cleanUrl(row[2]),
            description: cleanText(rest.join(" - ").replace(/\s*\[\.\.\.\]$/, "...")),
            tags: [],
            category: "datasets",
            section,
            source: source.name,
        });
    });
    return rows;
}

function parse(rawMarkdown, source) {
    if (source.format === "rst") return parseRst(rawMarkdown, source);
    // Turn reference links ("[Name]" plus "[name]: url") into inline links.
    const refs = new Map(
        [...rawMarkdown.matchAll(/^\[([^\]]+)\]:\s*(\S+)/gm)].map((m) => [m[1].toLowerCase(), m[2]])
    );
    const markdown = rawMarkdown.replace(/\[([^\]]+)\](?![(:])/g, (whole, name) =>
        refs.has(name.toLowerCase()) ? `[${name}](${refs.get(name.toLowerCase())})` : whole
    );
    const rows = [];
    const headings = { h2: "", h3: "", h4: "" };
    for (const line of markdown.split("\n")) {
        const heading = line.match(/^(#{2,4})\s+(.+?)\s*$/);
        if (heading) {
            const level = heading[1].length;
            const text = cleanText(heading[2]);
            if (level === 2) Object.assign(headings, { h2: text, h3: "", h4: "" });
            if (level === 3) Object.assign(headings, { h3: text, h4: "" });
            if (level === 4) headings.h4 = text;
            continue;
        }
        const row = line.match(
            /^\s*(?:[-*]|\|)\s*(?::[a-z_]+:\s*)*\[([^\]!][^\]]*)\]\((https?:\/\/[^)\s]+)\s*\)(.*)$/
        );
        if (!row) continue;
        const placed = source.map({ ...headings, line });
        if (!placed) continue;
        let url;
        try {
            url = cleanUrl(row[2]);
        } catch {
            continue;
        }
        const title = cleanText(row[1]);
        // In tables the description is the next cell; in lists it follows a dash.
        const rest = line.trimStart().startsWith("|") ? row[3].split("|").find((c) => c.trim()) ?? "" : row[3];
        if (title) rows.push({ title, url, description: cleanText(rest), tags: [], ...placed, source: source.name });
    }
    return rows;
}

async function readJson(file, fallback) {
    try {
        return JSON.parse(await readFile(file, "utf8"));
    } catch {
        return fallback;
    }
}

const DEAD_STATUS = new Set([404, 410]);

async function probe(url) {
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const response = await fetch(url, {
                redirect: "follow",
                signal: AbortSignal.timeout(15000),
                headers: { "user-agent": "Mozilla/5.0 (compatible; FreeHubLinkCheck/1.0)", accept: "*/*" },
            });
            await response.body?.cancel();
            // 401, 403, 429 and 5xx usually mean bot blocking, so they stay listed.
            return DEAD_STATUS.has(response.status) ? `dead:${response.status}` : "ok";
        } catch (error) {
            if (attempt === 1) return `dead:${error.cause?.code ?? error.name}`;
        }
    }
}

async function checkLinks(urls, status) {
    const queue = urls.filter((url) => !status[url]);
    console.log(`Checking ${queue.length} links (${urls.length - queue.length} cached)`);
    let done = 0;
    await Promise.all(
        Array.from({ length: 40 }, async () => {
            for (let url = queue.pop(); url; url = queue.pop()) {
                status[url] = await probe(url);
                if (++done % 250 === 0) {
                    console.log(`  ${done} checked`);
                    await writeFile(dataFile("link-status.json"), JSON.stringify(status, null, 0));
                }
            }
        })
    );
    await writeFile(dataFile("link-status.json"), JSON.stringify(status, null, 0));
}

const manual = (await readJson(dataFile("manual.json"), [])).map((item) => ({
    tags: [],
    ...item,
    source: "FreeHub",
    pick: true,
}));

const imported = [];
for (const source of SOURCES) {
    const response = await fetch(`https://raw.githubusercontent.com/${source.repo}/${source.path}`);
    if (!response.ok) throw new Error(`${source.repo}: HTTP ${response.status}`);
    const rows = parse(await response.text(), source);
    console.log(`${source.name}: ${rows.length} rows`);
    imported.push(...rows);
}

// Individual fonts and icon sets come from public catalogs, not from link lists.
const FONT_SECTIONS = {
    "sans-serif": "Sans serif",
    serif: "Serif",
    display: "Display",
    handwriting: "Handwriting",
    monospace: "Monospace",
    other: "Other fonts",
};

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response.json();
}

const fonts = (await fetchJson("https://api.fontsource.org/v1/fonts"))
    .filter((font) => font.category !== "icons")
    .map((font) => {
        const weights = font.weights.length;
        const style = font.variable ? "Variable font" : `${weights} ${weights === 1 ? "weight" : "weights"}`;
        const scripts = font.subsets.length;
        return {
            title: font.family,
            url: `https://fontsource.org/fonts/${font.id}`,
            description: `${style}, ${scripts} ${scripts === 1 ? "script" : "scripts"}. Self-host it with npm.`,
            category: "fonts",
            section: FONT_SECTIONS[font.category] ?? "Other fonts",
            tags: [font.license === "mit" ? "MIT" : font.license],
            source: "Fontsource",
            generated: true,
        };
    });

const iconSets = Object.entries(await fetchJson("https://api.iconify.design/collections"))
    .filter(([, set]) => !set.hidden)
    .map(([prefix, set]) => ({
        title: set.name,
        url: `https://icon-sets.iconify.design/${prefix}/`,
        description: `${set.total.toLocaleString("en-US")} icons${set.author?.name ? ` by ${set.author.name}` : ""}.`,
        category: "icons",
        section: "Icon sets",
        tags: [set.license?.spdx || set.license?.title].filter(Boolean),
        source: "Iconify",
        generated: true,
    }));
console.log(`Fontsource: ${fonts.length}, Iconify: ${iconSets.length}`);
imported.push(...fonts, ...iconSets);

for (const item of imported) item.section = SECTION_ALIASES[item.section] ?? item.section;

const seenUrls = new Set();
const seenTitles = new Set();
const unique = [...manual, ...imported].filter((item) => {
    const titleKey = `${item.category}:${item.title.toLowerCase()}`;
    const key = urlKey(item.url);
    if (seenUrls.has(key) || seenTitles.has(titleKey)) return false;
    seenUrls.add(key);
    seenTitles.add(titleKey);
    return true;
});

// FreeHub only lists what can be used for free and without strings attached.
const RESTRICTED_TAGS = /partly free|attribution|custom license|unspecified|cc-by|gpl|ufl|mashape/i;
const RESTRICTED_TEXT =
    /\b(paid|premium|freemium|pricing|subscriptions?|trial|commercial licen[sc]e|purchase|paywall|non-?commercial|personal use|free tier|free plan|attribution|credit required)\b|\$\d|\[\$\]/i;
const HARMLESS_TEXT =
    /(no|without|zero) attribution|attribution[- ](free|not required)|commercial (or|and) personal use|personal (or|and) commercial use|premium[- ]quality/gi;

function isFreeToUse(item) {
    if (item.tags.some((tag) => RESTRICTED_TAGS.test(tag))) return false;
    if (RESTRICTED_TEXT.test(item.description.replace(HARMLESS_TEXT, ""))) return false;
    // "Check pricing" lists don't state a price, so the description must say it's free.
    if (item.tags.includes("Check pricing")) return /open[- ]source|\bfree\b/i.test(item.description);
    return true;
}

const freeToUse = unique
    .filter(isFreeToUse)
    .map((item) => ({ ...item, tags: item.tags.filter((tag) => tag !== "Check pricing") }));
console.log(`${unique.length - freeToUse.length} removed as not free to use`);

const status = await readJson(dataFile("link-status.json"), {});
if (process.argv.includes("--check")) {
    await checkLinks(freeToUse.filter((item) => !item.generated).map((item) => item.url), status);
}

const alive = freeToUse.filter((item) => !status[item.url]?.startsWith("dead"));
console.log(`${freeToUse.length} free to use, ${freeToUse.length - alive.length} dead links removed`);

const categories = [];
for (const [index, [name, icon, description]] of CATEGORIES.entries()) {
    const items = alive
        .filter((item) => item.category === slug(name))
        .sort(
            (a, b) =>
                Number(b.pick ?? 0) - Number(a.pick ?? 0) ||
                Number(a.generated ?? 0) - Number(b.generated ?? 0) ||
                a.title.localeCompare(b.title, "en")
        )
        .map(({ title, description, url, section, tags, pick }, i) => ({
            id: i + 1,
            title,
            description,
            url,
            section,
            ...(tags.length ? { tags } : {}),
            ...(pick ? { pick } : {}),
        }));
    await writeFile(dbFile(`assets-${slug(name)}.json`), `${JSON.stringify(items, null, 0).replace(/\},\{/g, "},\n{")}\n`);
    categories.push({ id: index + 1, name, icon, description, count: items.length });
    console.log(`  ${name}: ${items.length}`);
}
await writeFile(dbFile("categories.json"), `${JSON.stringify(categories, null, 4)}\n`);

const notices = SOURCES.concat(EXTRA_SOURCES).map(
    (s) => `- [${s.name}](${s.url ?? `https://github.com/${s.repo}`}), ${s.license}${s.copyright ? `, ${s.copyright}` : ""}`
).join("\n");
const noticeText = `# Third-party notices

FreeHub's catalog is built from these lists, with edited and filtered entries:

${notices}

Awesome Music Production is used under the ISC license. The MIT-licensed lists
are used under these terms:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
await writeFile(new URL("THIRD-PARTY-NOTICES.md", root), noticeText);
await writeFile(new URL("public/third-party-notices.txt", root), noticeText);
