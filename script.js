const linksContainer = document.getElementById('linksContainer');
const currentTimeEl = document.getElementById('current-time');
const searchInput = document.getElementById('searchInput');
const categoryFilters = document.getElementById('categoryFilters');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const tagFilters = document.getElementById('tagFilters');
const statusFilter = document.getElementById('statusFilter');
const accentColorPicker = document.getElementById('accentColorPicker');

let currentCategory = 'Semua';
let currentTag = 'all';
let searchQuery = '';

const STATUS_LABELS = {
    working: 'Working',
    maintenance: 'Maintenance',
    updated: 'Updated'
};
const ACCENT_PRESETS = {
    lime: { accent: '#ccff00', hover: '#b3e600' },
    pink: { accent: '#ff4fa3', hover: '#e83e8c' },
    cyan: { accent: '#22d3ee', hover: '#06b6d4' },
    purple: { accent: '#a78bfa', hover: '#8b5cf6' }
};

function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g,
        char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])
    );
}
function normalizeTags(value) {
    const source = Array.isArray(value) ? value : String(value || '').split(',');
    return [...new Set(source.map(tag => String(tag).trim().replace(/^#+/, '').toLowerCase()).filter(Boolean))];
}
function normalizeStatus(status) {
    return Object.prototype.hasOwnProperty.call(STATUS_LABELS, status) ? status : 'working';
}

// Jam real-time
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    if (currentTimeEl) currentTimeEl.textContent = `${hours}.${minutes}.${seconds}`;
}
setInterval(updateTime, 1000);
updateTime();

// Warna aksen pilihan pengguna, terpisah dari mode gelap/terang.
function applyAccentColor(name) {
    const selected = ACCENT_PRESETS[name] ? name : 'lime';
    const preset = ACCENT_PRESETS[selected];
    document.body.style.setProperty('--accent-color', preset.accent);
    document.body.style.setProperty('--accent-hover', preset.hover);
    if (accentColorPicker) accentColorPicker.value = selected;
    localStorage.setItem('danzz_accent_color', selected);
}
applyAccentColor(localStorage.getItem('danzz_accent_color') || 'lime');
if (accentColorPicker) {
    accentColorPicker.addEventListener('change', event => applyAccentColor(event.target.value));
}

// Dark Mode Handler lama
let isDarkMode = localStorage.getItem('dark_mode') === 'true';
if (isDarkMode) {
    document.body.classList.add('dark-mode');
    if (themeToggleBtn) themeToggleBtn.textContent = '☀️ TERANG';
}
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        localStorage.setItem('dark_mode', isDarkMode);
        themeToggleBtn.textContent = isDarkMode ? '☀️ TERANG' : '🌙 MODE';
    });
}

// Data lama tetap dibaca dari key yang sama.
let links = JSON.parse(localStorage.getItem('saved_links')) || [];

function getAllTags() {
    return [...new Set(links.flatMap(link => normalizeTags(link.tags)))].sort();
}

// Filter kategori dinamis
function renderCategoryFilters() {
    if (!categoryFilters) return;
    const categories = JSON.parse(localStorage.getItem('saved_categories')) || ['Game', 'Aplikasi', 'Tools', 'Lainnya'];
    categoryFilters.innerHTML = '';
    const allButton = document.createElement('button');
    allButton.className = `filter-btn ${currentCategory === 'Semua' ? 'active' : ''}`;
    allButton.dataset.cat = 'Semua';
    allButton.textContent = 'Semua';
    categoryFilters.appendChild(allButton);
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = `filter-btn ${currentCategory === category ? 'active' : ''}`;
        button.dataset.cat = category;
        button.textContent = category;
        categoryFilters.appendChild(button);
    });
}

// Filter tag dinamis
function renderTagFilters() {
    if (!tagFilters) return;
    tagFilters.innerHTML = '';
    const allButton = document.createElement('button');
    allButton.type = 'button';
    allButton.className = `tag-filter ${currentTag === 'all' ? 'active' : ''}`;
    allButton.dataset.tag = 'all';
    allButton.textContent = 'Semua tag';
    tagFilters.appendChild(allButton);

    getAllTags().forEach(tag => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `tag-filter ${currentTag === tag ? 'active' : ''}`;
        button.dataset.tag = tag;
        button.textContent = `#${tag}`;
        tagFilters.appendChild(button);
    });
}

function renderPublicLinks() {
    if (!linksContainer) return;
    linksContainer.innerHTML = '';

    const selectedStatus = statusFilter ? statusFilter.value : 'all';
    const filteredLinks = links.filter(link => {
        const tags = normalizeTags(link.tags);
        const status = normalizeStatus(link.status);
        const matchesCategory = currentCategory === 'Semua' || link.category === currentCategory;
        const matchesTag = currentTag === 'all' || tags.includes(currentTag);
        const matchesStatus = selectedStatus === 'all' || status === selectedStatus;
        const query = searchQuery.toLowerCase();
        const searchable = [
            link.title, link.url, link.notes, link.category,
            ...tags.map(tag => `#${tag}`), STATUS_LABELS[status]
        ].join(' ').toLowerCase();
        return matchesCategory && matchesTag && matchesStatus && searchable.includes(query);
    });

    filteredLinks.sort((a, b) => (b.pinned === true) - (a.pinned === true));
    if (filteredLinks.length === 0) {
        linksContainer.innerHTML = '<div class="empty-state">Tidak ada tautan yang ditemukan.</div>';
        return;
    }

    filteredLinks.forEach(link => {
        const item = document.createElement('div');
        item.className = `link-item ${link.pinned ? 'pinned' : ''}`;
        const tags = normalizeTags(link.tags);
        const status = normalizeStatus(link.status);
        const tagMarkup = tags.map(tag => `<span class="tag-chip">#${escapeHTML(tag)}</span>`).join('');
        const notesMarkup = link.notes ? `<div class="link-notes">💬 ${escapeHTML(link.notes)}</div>` : '';
        const pinnedMarkup = link.pinned ? '<span class="badge-pinned">📌 PINNED</span>' : '';
        const imageMarkup = link.imageUrl
            ? `<div class="link-image-container"><img src="${escapeHTML(link.imageUrl)}" alt="${escapeHTML(link.title)}" class="link-thumbnail"></div>`
            : '';

        item.innerHTML = `
            ${imageMarkup}
            <div class="link-content-row">
                <div class="link-info">
                    <div class="link-meta-row">
                        <span class="badge-cat">${escapeHTML(link.category)}</span>
                        ${pinnedMarkup}
                        <span class="status-badge status-${status}">${STATUS_LABELS[status]}</span>
                    </div>
                    <span class="link-title">${escapeHTML(link.title)}</span>
                    <div class="tag-list">${tagMarkup}</div>
                    <a href="${escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer" class="link-url">${escapeHTML(link.url)}</a>
                    ${notesMarkup}
                </div>
                <div class="link-actions">
                    <a href="${escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer" class="btn-action visit">Buka</a>
                </div>
            </div>`;
        linksContainer.appendChild(item);
    });
}

if (searchInput) {
    searchInput.addEventListener('input', event => {
        searchQuery = event.target.value;
        renderPublicLinks();
    });
}
if (categoryFilters) {
    categoryFilters.addEventListener('click', event => {
        const button = event.target.closest('.filter-btn');
        if (!button) return;
        categoryFilters.querySelectorAll('.filter-btn').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        currentCategory = button.dataset.cat;
        renderPublicLinks();
    });
}
if (tagFilters) {
    tagFilters.addEventListener('click', event => {
        const button = event.target.closest('.tag-filter');
        if (!button) return;
        tagFilters.querySelectorAll('.tag-filter').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        currentTag = button.dataset.tag;
        renderPublicLinks();
    });
}
if (statusFilter) statusFilter.addEventListener('change', renderPublicLinks);

// Inisialisasi
renderCategoryFilters();
renderTagFilters();
renderPublicLinks();
