import * as params from '@params';

const resList = document.getElementById('searchResults');
const sInput = document.getElementById('searchInput');
const searchBox = document.getElementById('searchbox');
const status = document.getElementById('searchStatus');
const retry = document.getElementById('searchRetry');
let fuse;
let loading = false;
let firstResult = null;
let lastResult = null;

const defaultFuseOptions = {
    distance: 100, threshold: 0.4, ignoreLocation: true,
    keys: ['title', 'permalink', 'summary', 'content']
};
const buildFuseOptions = () => !params.fuseOpts ? defaultFuseOptions : {
    isCaseSensitive: params.fuseOpts.iscasesensitive ?? false,
    includeScore: params.fuseOpts.includescore ?? false,
    includeMatches: params.fuseOpts.includematches ?? false,
    minMatchCharLength: params.fuseOpts.minmatchcharlength ?? 1,
    shouldSort: params.fuseOpts.shouldsort ?? true,
    findAllMatches: params.fuseOpts.findallmatches ?? false,
    keys: params.fuseOpts.keys ?? defaultFuseOptions.keys,
    location: params.fuseOpts.location ?? 0,
    threshold: params.fuseOpts.threshold ?? defaultFuseOptions.threshold,
    distance: params.fuseOpts.distance ?? defaultFuseOptions.distance,
    ignoreLocation: params.fuseOpts.ignorelocation ?? defaultFuseOptions.ignoreLocation
};

const renderResults = (results) => {
    resList.replaceChildren();
    firstResult = lastResult = null;
    for (const result of results) {
        const li = document.createElement('li');
        li.textContent = result.item.title;
        const link = document.createElement('a');
        link.className = 'entry-link';
        link.href = result.item.permalink;
        link.setAttribute('aria-label', result.item.title);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('aria-hidden', 'true');
        svg.innerHTML = '<path d="m13 7 5 5-5 5M6 7l5 5-5 5"/>';
        li.append(svg, link);
        resList.appendChild(li);
    }
    firstResult = resList.firstElementChild;
    lastResult = resList.lastElementChild;
};

const performSearch = () => {
    if (!fuse) return;
    const query = sInput.value.trim();
    if (!query) {
        renderResults([]);
        status.textContent = 'Search is ready. Enter a term to find a page.';
        return;
    }
    const options = params.fuseOpts?.limit ? { limit: params.fuseOpts.limit } : undefined;
    const results = fuse.search(query, options);
    renderResults(results);
    status.textContent = results.length
        ? `${results.length} ${results.length === 1 ? 'result' : 'results'} for "${query}".`
        : `No results for "${query}". Try another term.`;
};

const initSearch = async () => {
    if (!sInput || !resList || loading) return;
    loading = true;
    sInput.disabled = false;
    retry.hidden = true;
    resList.setAttribute('aria-busy', 'true');
    status.textContent = 'Loading search index...';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(sInput.dataset.index, { signal: controller.signal });
        if (!response.ok) throw new Error(`Search index load failed: ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data) || data.some(item => !item ||
            typeof item.title !== 'string' || typeof item.permalink !== 'string')) {
            throw new Error('Search index has an invalid format.');
        }
        fuse = new Fuse(data, buildFuseOptions());
        performSearch();
    } catch (error) {
        console.error('Search is unavailable:', error);
        status.textContent = 'Search could not load. Check your connection and retry.';
        retry.hidden = false;
    } finally {
        clearTimeout(timeout);
        loading = false;
        resList.setAttribute('aria-busy', 'false');
    }
};

let debounce;
sInput?.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(performSearch, 150);
});
sInput?.addEventListener('search', performSearch);
retry?.addEventListener('click', () => {
    sInput.focus();
    initSearch();
});

const setActiveResult = (element) => {
    resList.querySelectorAll('.focus').forEach(item => item.classList.remove('focus'));
    if (!element) return;
    element.focus();
    if (resList.contains(element)) element.parentElement.classList.add('focus');
};
document.addEventListener('keydown', (event) => {
    const active = document.activeElement;
    if (!searchBox?.contains(active)) return;
    if (event.key === 'Escape') {
        sInput.value = '';
        performSearch();
        sInput.focus();
        return;
    }
    if (!firstResult) return;
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (active === sInput) setActiveResult(firstResult.querySelector('.entry-link'));
        else if (active?.parentElement !== lastResult)
            setActiveResult(active?.parentElement?.nextElementSibling?.querySelector('.entry-link'));
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (active?.parentElement === firstResult) setActiveResult(sInput);
        else if (active !== sInput)
            setActiveResult(active?.parentElement?.previousElementSibling?.querySelector('.entry-link'));
    } else if (event.key === 'ArrowRight' && active?.matches('.entry-link')) {
        active.click();
    }
});
window.addEventListener('load', initSearch);
