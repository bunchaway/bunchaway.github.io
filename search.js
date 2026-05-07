let shardMap = [];
let currentFilter = 'all';
let history = JSON.parse(localStorage.getItem('vnedict_history') || '[]');
let favorites = JSON.parse(localStorage.getItem('vnedict_favorites') || '{}');

const API_BASE = 'https://bunchaway.github.io/tudien_api';
const SUGGESTIONS_DIV = document.getElementById('suggestions');
const RESULTS_DIV = document.getElementById('results');
const SEARCH_INPUT = document.getElementById('searchInput');

// Khởi tạo: Tải shard map
async function init() {
    try {
        const response = await fetch(`${API_BASE}/shard_map.json`);
        shardMap = await response.json();
    } catch (e) {
        console.error('Failed to load shard map', e);
    }
    
    renderHistory();
    renderFavorites();
    
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
        SEARCH_INPUT.value = query;
        performSearch(query);
    }
}

function findBestShard(query) {
    if (!query) return null;
    const lowerQuery = query.toLowerCase();
    return shardMap.find(shard => lowerQuery.startsWith(shard));
}

async function performSearch(query) {
    if (!query || query.trim() === '') return;
    
    RESULTS_DIV.innerHTML = '<div class="loading">Searching...</div>';
    SUGGESTIONS_DIV.classList.remove('active');

    const shard = findBestShard(query);
    if (!shard) {
        showError('Could not determine shard for this query.');
        return;
    }

    const safeShard = shard.replace(/[ /\\:]/g, '_');

    try {
        const response = await fetch(`${API_BASE}/api/${safeShard}.json`);
        const data = await response.json();
        const entry = data.find(item => item.word.toLowerCase() === query.toLowerCase());

        if (entry) {
            renderEntry(entry);
            addToHistory(entry.word);
        } else {
            showError('Không tìm thấy từ chính xác này.');
        }
    } catch (e) {
        showError('Lỗi kết nối máy chủ.');
    }
}

function renderEntry(entry) {
    const isFav = !!favorites[entry.word];
    
    let html = `
        <div class="result-header" style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--spacing-md);">
            <h1 class="result-word" style="margin: 0;">${entry.word}</h1>
            <button class="btn-small favorite-btn" onclick="toggleFavorite('${entry.word.replace(/'/g, "\\'")}')" style="background: none; border: 1px solid var(--border); border-radius: var(--radius-full); padding: 5px 15px; cursor: pointer;">
                ${isFav ? '★' : '☆'}
            </button>
        </div>
    `;

    // Filter definitions based on currentFilter
    let filteredDefs = entry.definitions;
    if (currentFilter === 'mono') {
        filteredDefs = entry.definitions.filter(d => d.type === 'mono');
    } else if (currentFilter === 'bilingual') {
        filteredDefs = entry.definitions.filter(d => d.type === 'bilingual');
    }

    // Check if there are any definitions after filtering
    if (filteredDefs.length === 0) {
        html += `<p style="color: var(--text-muted); font-style: italic;">No definitions available for this filter.</p>`;
        RESULTS_DIV.innerHTML = html;
        return;
    }

    // Group by source
    const groups = {};
    filteredDefs.forEach(def => {
        const sourceKey = def.dicts.join(', ');
        if (!groups[sourceKey]) groups[sourceKey] = [];
        groups[sourceKey].push(def);
    });

    for (const source in groups) {
        html += `
            <div class="source-group">
                <span class="source-header">${source}</span>
                <div class="definitions-list">
                    ${groups[source].map(def => {
                        let text = def.text;
                        let posHtml = '';
                        const posMatch = text.match(/^([a-z.]+)\s/i);
                        if (posMatch && posMatch[1].length < 10) {
                            posHtml = `<span class="pos">${posMatch[1]}</span>`;
                            text = text.substring(posMatch[0].length);
                        }
                        
                        // Replace escape sequences with HTML
                        text = text.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');

                        return `
                            <div class="definition-row">
                                ${posHtml}<span class="definition-text">${text}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    RESULTS_DIV.innerHTML = html;
}

// Gợi ý Autocomplete
let debounceTimer;
SEARCH_INPUT.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = SEARCH_INPUT.value.trim();
    if (query.length < 1) {
        SUGGESTIONS_DIV.classList.remove('active');
        return;
    }

    debounceTimer = setTimeout(async () => {
        const shard = findBestShard(query);
        if (!shard) return;

        const safeShard = shard.replace(/[ /\\:]/g, '_');

        try {
            const response = await fetch(`${API_BASE}/suggestions/${safeShard}.json`);
            const words = await response.json();
            const filtered = words
                .filter(w => w.toLowerCase().startsWith(query.toLowerCase()))
                .slice(0, 10);

            if (filtered.length > 0) {
                SUGGESTIONS_DIV.innerHTML = filtered.map(w => 
                    `<div class="suggestion-item" onclick="selectSuggestion('${w.replace(/'/g, "\\'")}')" role="option" style="padding: var(--spacing-xs) var(--spacing-sm); cursor: pointer;">${w}</div>`
                ).join('');
                SUGGESTIONS_DIV.classList.add('active');
            } else {
                SUGGESTIONS_DIV.classList.remove('active');
            }
        } catch (e) {
            console.error('Autocomplete error', e);
        }
    }, 300);
});

function selectSuggestion(word) {
    SEARCH_INPUT.value = word;
    SUGGESTIONS_DIV.classList.remove('active');
    performSearch(word);
}

function addToHistory(word) {
    history = [word, ...history.filter(w => w !== word)].slice(0, 20);
    localStorage.setItem('vnedict_history', JSON.stringify(history));
    renderHistory();
}

function toggleFavorite(word) {
    if (favorites[word]) {
        delete favorites[word];
    } else {
        favorites[word] = true;
    }
    localStorage.setItem('vnedict_favorites', JSON.stringify(favorites));
    renderFavorites();
    performSearch(word); 
}

function renderHistory() {
    const list = document.getElementById('historyList');
    if (!list) return;
    if (history.length === 0) {
        list.innerHTML = '<p class="panel-empty">No history available</p>';
    } else {
        list.innerHTML = history.map(w => `
            <li>
                <button onclick="selectSuggestion('${w.replace(/'/g, "\\'")}')">${w}</button>
            </li>
        `).join('');
    }
}

function renderFavorites() {
    const list = document.getElementById('favList');
    if (!list) return;
    const favWords = Object.keys(favorites).sort();
    if (favWords.length === 0) {
        list.innerHTML = '<p class="panel-empty">The list is empty</p>';
    } else {
        list.innerHTML = favWords.map(w => `
            <li>
                <button onclick="selectSuggestion('${w.replace(/'/g, "\\'")}')">${w}</button>
            </li>
        `).join('');
    }
}

function showError(msg) {
    RESULTS_DIV.innerHTML = `<div class="error-message">${msg}</div>`;
}

document.getElementById('searchBtn').addEventListener('click', () => performSearch(SEARCH_INPUT.value));
SEARCH_INPUT.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch(SEARCH_INPUT.value);
        SUGGESTIONS_DIV.classList.remove('active');
    }
});

// Filter button event listeners
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.type;
        const currentQuery = SEARCH_INPUT.value;
        if (currentQuery) performSearch(currentQuery);
    });
});

init();
