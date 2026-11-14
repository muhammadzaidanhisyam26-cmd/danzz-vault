// Keamanan halaman Admin (dipertahankan dari sistem sebelumnya)
(function checkAdminAuth() {
    const authed = sessionStorage.getItem('admin_logged') === 'true';
    if (!authed) {
        const pass = prompt('Masukkan Password Admin:');
        if (pass === 'admin123') {
            sessionStorage.setItem('admin_logged', 'true');
        } else {
            alert('Password salah! Dikembalikan ke halaman utama.');
            window.location.href = 'index.html';
        }
    }
})();

const linkForm = document.getElementById('linkForm');
const linkTitleInput = document.getElementById('linkTitle');
const linkCategoryInput = document.getElementById('linkCategory');
const linkUrlInput = document.getElementById('linkUrl');
const linkNotesInput = document.getElementById('linkNotes');
const linksContainer = document.getElementById('linksContainer');
const totalLinksEl = document.getElementById('totalLinks');
const clearStorageBtn = document.getElementById('clearStorageBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');

const categoryForm = document.getElementById('categoryForm');
const newCategoryInput = document.getElementById('newCategoryInput');
const categoryList = document.getElementById('categoryList');

const imageUrlInput = document.getElementById('imageUrl');
const imageFileInput = document.getElementById('imageFile');
const previewImg = document.getElementById('previewImg');
const previewPlaceholder = document.getElementById('previewPlaceholder');

// Fitur tambahan
const linkTagsInput = document.getElementById('linkTags');
const linkStatusInput = document.getElementById('linkStatus');
const accentColorPicker = document.getElementById('accentColorPicker');
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

let temporaryImageData = '';

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

function applyAccentColor(name) {
    const selected = ACCENT_PRESETS[name] ? name : 'lime';
    const preset = ACCENT_PRESETS[selected];
    document.body.style.setProperty('--accent-color', preset.accent);
    document.body.style.setProperty('--accent-hover', preset.hover);
    if (accentColorPicker) accentColorPicker.value = selected;
    localStorage.setItem('danzz_accent_color', selected);
}

const savedAccent = localStorage.getItem('danzz_accent_color') || 'lime';
applyAccentColor(savedAccent);
if (accentColorPicker) {
    accentColorPicker.addEventListener('change', event => applyAccentColor(event.target.value));
}

// Preview foto dari URL
if (imageUrlInput) {
    imageUrlInput.addEventListener('input', function () {
        const url = this.value.trim();
        if (url) {
            previewImg.src = url;
            previewImg.style.display = 'block';
            previewPlaceholder.style.display = 'none';
            temporaryImageData = url;
            if (imageFileInput) imageFileInput.value = '';
        } else {
            resetPreview();
        }
    });
}

// Preview dan konversi foto dari perangkat
if (imageFileInput) {
    imageFileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) {
            resetPreview();
            return;
        }
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Format file tidak didukung! Pilih JPG, JPEG, PNG, atau WEBP.');
            this.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function (loadEvent) {
            previewImg.src = loadEvent.target.result;
            previewImg.style.display = 'block';
            previewPlaceholder.style.display = 'none';
            temporaryImageData = loadEvent.target.result;
            if (imageUrlInput) imageUrlInput.value = '';
        };
        reader.readAsDataURL(file);
    });
}

function resetPreview() {
    if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
    }
    if (previewPlaceholder) previewPlaceholder.style.display = 'block';
    temporaryImageData = '';
}

// Dark mode lama tetap digunakan
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

let links = JSON.parse(localStorage.getItem('saved_links')) || [];
let categories = JSON.parse(localStorage.getItem('saved_categories')) || ['Game', 'Aplikasi', 'Tools', 'Lainnya'];

function saveCategories() {
    localStorage.setItem('saved_categories', JSON.stringify(categories));
    renderCategoryDropdown();
    renderCategoryManagerList();
}

function renderCategoryDropdown() {
    if (!linkCategoryInput) return;
    linkCategoryInput.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        linkCategoryInput.appendChild(option);
    });
}

function renderCategoryManagerList() {
    if (!categoryList) return;
    categoryList.innerHTML = '';
    categories.forEach((category, index) => {
        const badge = document.createElement('div');
        badge.className = 'category-manager-badge';
        badge.innerHTML = `<span>${escapeHTML(category)}</span>
            ${categories.length > 1 ? `<button type="button" onclick="deleteCategory(${index})" aria-label="Hapus kategori">×</button>` : ''}`;
        categoryList.appendChild(badge);
    });
}

if (categoryForm) {
    categoryForm.addEventListener('submit', event => {
        event.preventDefault();
        const newCategory = newCategoryInput.value.trim();
        if (newCategory && !categories.includes(newCategory)) {
            categories.push(newCategory);
            saveCategories();
            newCategoryInput.value = '';
            alert(`Kategori "${newCategory}" berhasil ditambahkan!`);
        } else {
            alert('Kategori sudah ada atau tidak valid.');
        }
    });
}

window.deleteCategory = function (index) {
    const category = categories[index];
    if (confirm(`Yakin ingin menghapus kategori "${category}"?`)) {
        categories.splice(index, 1);
        saveCategories();
    }
};

function saveAndRenderAdmin() {
    localStorage.setItem('saved_links', JSON.stringify(links));
    renderAdminLinks();
}

function renderAdminLinks() {
    if (!linksContainer) return;
    linksContainer.innerHTML = '';
    if (totalLinksEl) totalLinksEl.textContent = links.length;

    if (links.length === 0) {
        linksContainer.innerHTML = '<div class="empty-state">Belum ada tautan. Silakan tambah di atas!</div>';
        return;
    }

    const sortedLinks = [...links].sort((a, b) => (b.pinned === true) - (a.pinned === true));
    sortedLinks.forEach(link => {
        const index = links.indexOf(link);
        const item = document.createElement('div');
        item.className = `link-item ${link.pinned ? 'pinned' : ''}`;
        const tags = normalizeTags(link.tags);
        const tagMarkup = tags.map(tag => `<span class="tag-chip">#${escapeHTML(tag)}</span>`).join('');
        const status = normalizeStatus(link.status);
        const imageMarkup = link.imageUrl
            ? `<div class="link-image-container"><img src="${escapeHTML(link.imageUrl)}" alt="${escapeHTML(link.title)}" class="link-thumbnail"></div>`
            : '';

        item.innerHTML = `
            ${imageMarkup}
            <div class="link-content-row">
                <div class="link-info">
                    <div class="link-meta-row">
                        <span class="badge-cat">${escapeHTML(link.category)}</span>
                        ${link.pinned ? '<span class="badge-pinned">📌 PINNED</span>' : ''}
                        <span class="status-badge status-${status}">${STATUS_LABELS[status]}</span>
                    </div>
                    <span class="link-title">${escapeHTML(link.title)}</span>
                    <div class="tag-list">${tagMarkup || '<span class="muted-small">Belum ada tag</span>'}</div>
                    <a href="${escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer" class="link-url">${escapeHTML(link.url)}</a>
                    ${link.notes ? `<div class="link-notes">💬 ${escapeHTML(link.notes)}</div>` : ''}
                    <div class="admin-inline-controls">
                        <label>Ubah status
                            <select onchange="setLinkStatus(${index}, this.value)">
                                <option value="working" ${status === 'working' ? 'selected' : ''}>Working</option>
                                <option value="maintenance" ${status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                                <option value="updated" ${status === 'updated' ? 'selected' : ''}>Updated</option>
                            </select>
                        </label>
                        <button type="button" class="btn-action" onclick="editLinkTags(${index})">Edit tag</button>
                    </div>
                </div>
                <div class="link-actions">
                    <a href="${escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer" class="btn-action visit">Buka</a>
                    <button type="button" class="btn-action pin" onclick="togglePin(${index})">${link.pinned ? 'Unpin' : 'Pin'}</button>
                    <button type="button" class="btn-action delete" onclick="deleteLink(${index})">Hapus</button>
                </div>
            </div>`;
        linksContainer.appendChild(item);
    });
}

window.setLinkStatus = function (index, status) {
    if (!links[index]) return;
    links[index].status = normalizeStatus(status);
    saveAndRenderAdmin();
};

window.editLinkTags = function (index) {
    if (!links[index]) return;
    const current = normalizeTags(links[index].tags).join(', ');
    const input = prompt('Masukkan tag, pisahkan dengan koma. Contoh: offline, pc, multiplayer', current);
    if (input === null) return;
    links[index].tags = normalizeTags(input);
    saveAndRenderAdmin();
};

if (linkForm) {
    linkForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const newLink = {
            title: linkTitleInput.value.trim(),
            category: linkCategoryInput.value,
            url: linkUrlInput.value.trim(),
            notes: linkNotesInput.value.trim(),
            imageUrl: temporaryImageData,
            pinned: false,
            tags: normalizeTags(linkTagsInput ? linkTagsInput.value : ''),
            status: normalizeStatus(linkStatusInput ? linkStatusInput.value : 'working')
        };

        links.unshift(newLink);
        saveAndRenderAdmin();

        linkTitleInput.value = '';
        linkUrlInput.value = '';
        linkNotesInput.value = '';
        if (linkTagsInput) linkTagsInput.value = '';
        if (linkStatusInput) linkStatusInput.value = 'working';
        if (imageUrlInput) imageUrlInput.value = '';
        if (imageFileInput) imageFileInput.value = '';
        resetPreview();
        alert('Tautan berhasil disimpan!');
    });
}

window.deleteLink = function (index) {
    if (confirm('Yakin ingin menghapus tautan ini?')) {
        links.splice(index, 1);
        saveAndRenderAdmin();
    }
};

window.togglePin = function (index) {
    if (!links[index]) return;
    links[index].pinned = !links[index].pinned;
    saveAndRenderAdmin();
};

if (clearStorageBtn) {
    clearStorageBtn.addEventListener('click', function () {
        if (confirm('Yakin ingin menghapus seluruh tautan?')) {
            links = [];
            saveAndRenderAdmin();
        }
    });
}

if (exportBtn) {
    exportBtn.addEventListener('click', function () {
        const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(links, null, 2));
        const anchor = document.createElement('a');
        anchor.setAttribute('href', data);
        anchor.setAttribute('download', `danzz_vault_backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    });
}

if (importFile) {
    importFile.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = function (loadEvent) {
            try {
                const imported = JSON.parse(loadEvent.target.result);
                if (Array.isArray(imported)) {
                    // Data lama tetap diterima; field baru diberi nilai default.
                    links = imported.map(link => ({
                        ...link,
                        tags: normalizeTags(link.tags),
                        status: normalizeStatus(link.status)
                    }));
                    saveAndRenderAdmin();
                    alert('Data berhasil diimpor!');
                } else {
                    alert('Format file JSON tidak valid.');
                }
            } catch (error) {
                alert('Gagal membaca file JSON.');
            }
            importFile.value = '';
        };
    });
}

// Inisialisasi
renderCategoryDropdown();
renderCategoryManagerList();
renderAdminLinks();
