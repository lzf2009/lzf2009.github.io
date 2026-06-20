// ========== 数据存储层 ==========
const STORAGE_KEYS = {
    POSTS: 'blognav_posts',
    SITES: 'blognav_sites',
    POST_CATEGORIES: 'blognav_post_cats',
    SITE_CATEGORIES: 'blognav_site_cats'
};

// 初始化默认数据
function initDefaultData() {
    if (!localStorage.getItem(STORAGE_KEYS.POST_CATEGORIES)) {
        localStorage.setItem(STORAGE_KEYS.POST_CATEGORIES, JSON.stringify(['技术笔记', '生活随笔', '读书分享', '工具推荐']));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SITE_CATEGORIES)) {
        localStorage.setItem(STORAGE_KEYS.SITE_CATEGORIES, JSON.stringify(['搜索引擎', '开发工具', '设计资源', '学习教育', '常用社交']));
    }
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
        const samplePosts = [
            {
                id: 'p1',
                title: '欢迎使用 BlogNav 博客系统',
                summary: '这是一个纯前端的博客与网址导航系统，无需后端即可部署在 GitHub Pages 上。',
                content: '# 欢迎使用\n\n这是一个纯前端实现的博客与网址导航系统。\n\n## 主要功能\n\n- ✅ 文章发布与管理，支持 Markdown\n- ✅ 网址导航分类管理\n- ✅ 全站搜索\n- ✅ 响应式布局，适配手机平板\n- ✅ 数据本地存储，支持导入导出\n\n## 如何开始\n\n进入「管理后台」即可开始创建文章和添加网址。',
                category: '技术笔记',
                tags: ['公告', '教程'],
                date: new Date().toISOString(),
                updated: new Date().toISOString(),
                top: true,
                wordCount: 0
            }
        ];
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(samplePosts));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SITES)) {
        const sampleSites = [
            { id: 's1', name: 'GitHub', description: '全球最大的代码托管平台', icon: '', url: 'https://github.com', backupUrls: [], category: '开发工具', tags: ['代码', '开源'], keywords: ['git', '代码托管', '开源社区'] },
            { id: 's2', name: '百度', description: '中文搜索引擎', icon: '', url: 'https://www.baidu.com', backupUrls: [], category: '搜索引擎', tags: ['搜索'], keywords: ['百度一下', '搜索引擎'] },
            { id: 's3', name: 'B站', description: '哔哩哔哩弹幕视频网', icon: '', url: 'https://www.bilibili.com', backupUrls: [], category: '常用社交', tags: ['视频', '娱乐'], keywords: ['哔哩哔哩', '弹幕'] }
        ];
        localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(sampleSites));
    }
}

// 数据读写
function getData(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}
function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ========== 首页渲染 ==========
function renderHomePage() {
    initDefaultData();
    renderPostsList();
    renderSitesWidget();
    initGlobalSearch();
}

function renderPostsList() {
    const posts = getData(STORAGE_KEYS.POSTS)
        .sort((a, b) => {
            if (a.top && !b.top) return -1;
            if (!a.top && b.top) return 1;
            return new Date(b.date) - new Date(a.date);
        })
        .slice(0, 5);

    const container = document.getElementById('postsList');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:40px 0;">暂无文章</p>';
        return;
    }

    container.innerHTML = posts.map(post => `
        <article class="post-card ${post.top ? 'top' : ''}">
            <h3>${escapeHtml(post.title)}</h3>
            <p class="summary">${escapeHtml(post.summary || post.content.substring(0, 80) + '...')}</p>
            <div class="meta">
                <span>${formatDate(post.date)}</span>
                <span>${post.category}</span>
                ${(post.tags || []).slice(0, 2).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
            </div>
            <a href="post.html?id=${post.id}" class="read-more">阅读全文 →</a>
        </article>
    `).join('');
}

function renderSitesWidget() {
    const sites = getData(STORAGE_KEYS.SITES).slice(0, 6);
    const container = document.getElementById('sitesWidget');
    if (!container) return;

    container.innerHTML = sites.map(site => `
        <div class="site-card" onclick="window.open('${site.url}', '_blank')">
            <div class="site-icon">${getSiteIconHtml(site)}</div>
            <div class="site-info">
                <div class="name">${escapeHtml(site.name)}</div>
                <div class="desc">${escapeHtml(site.description || '')}</div>
            </div>
        </div>
    `).join('');
}

// ========== 全局搜索 ==========
function initGlobalSearch() {
    const input = document.getElementById('globalSearch');
    const results = document.getElementById('searchResults');
    if (!input || !results) return;

    input.addEventListener('input', () => {
        const keyword = input.value.trim().toLowerCase();
        if (!keyword) {
            results.classList.remove('show');
            return;
        }

        const posts = getData(STORAGE_KEYS.POSTS);
        const sites = getData(STORAGE_KEYS.SITES);
        const matched = [];

        // 搜索文章
        posts.forEach(p => {
            if (p.title.toLowerCase().includes(keyword) ||
                p.content.toLowerCase().includes(keyword) ||
                p.category.toLowerCase().includes(keyword) ||
                (p.tags || []).some(t => t.toLowerCase().includes(keyword))) {
                matched.push({ type: '文章', title: p.title, url: `post.html?id=${p.id}` });
            }
        });

        // 搜索网址
        sites.forEach(s => {
            if (s.name.toLowerCase().includes(keyword) ||
                s.description?.toLowerCase().includes(keyword) ||
                s.category.toLowerCase().includes(keyword) ||
                (s.tags || []).some(t => t.toLowerCase().includes(keyword)) ||
                (s.keywords || []).some(k => k.toLowerCase().includes(keyword))) {
                matched.push({ type: '网址', title: s.name, url: s.url, target: '_blank' });
            }
        });

        if (matched.length === 0) {
            results.innerHTML = '<div class="search-item">未找到相关结果</div>';
        } else {
            results.innerHTML = matched.slice(0, 10).map(item => `
                <div class="search-item" onclick="window.open('${item.url}', '${item.target || '_self'}')">
                    <div class="type">${item.type}</div>
                    <div class="title">${escapeHtml(item.title)}</div>
                </div>
            `).join('');
        }
        results.classList.add('show');
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !results.contains(e.target)) {
            results.classList.remove('show');
        }
    });
}

// ========== 文章详情页 ==========
function loadPostDetail() {
    initDefaultData();
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        document.getElementById('postContent').innerHTML = '<p>文章不存在</p>';
        return;
    }

    const posts = getData(STORAGE_KEYS.POSTS);
    const post = posts.find(p => p.id === id);
    if (!post) {
        document.getElementById('postContent').innerHTML = '<p>文章不存在</p>';
        return;
    }

    document.getElementById('postTitle').textContent = post.title;
    document.getElementById('postDate').textContent = formatDate(post.updated || post.date);
    document.getElementById('postWordCount').textContent = countWords(post.content) + ' 字';
    document.getElementById('postCategory').textContent = post.category;
    document.getElementById('postTags').innerHTML = (post.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
    document.getElementById('postBody').innerHTML = marked.parse(post.content);
    document.title = post.title + ' | BlogNav';
}

// ========== 网址导航页 ==========
function renderSitesPage() {
    initDefaultData();
    renderSiteCategories();
    renderSitesContent();
    initSiteSearch();
}

function renderSiteCategories() {
    const categories = getData(STORAGE_KEYS.SITE_CATEGORIES);
    const container = document.getElementById('siteCategories');
    if (!container) return;

    let html = '<div class="cat-item active" data-cat="all">全部</div>';
    categories.forEach(cat => {
        html += `<div class="cat-item" data-cat="${escapeHtml(cat)}">${escapeHtml(cat)}</div>`;
    });
    container.innerHTML = html;

    container.querySelectorAll('.cat-item').forEach(item => {
        item.addEventListener('click', () => {
            container.querySelectorAll('.cat-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const cat = item.dataset.cat;
            filterSitesByCategory(cat);
        });
    });
}

function renderSitesContent(filter = null) {
    const sites = getData(STORAGE_KEYS.SITES);
    const categories = getData(STORAGE_KEYS.SITE_CATEGORIES);
    const container = document.getElementById('sitesContent');
    if (!container) return;

    let filteredSites = sites;
    if (filter && filter !== 'all') {
        filteredSites = sites.filter(s => s.category === filter);
    }

    // 按分类分组
    const grouped = {};
    categories.forEach(cat => grouped[cat] = []);
    filteredSites.forEach(s => {
        if (!grouped[s.category]) grouped[s.category] = [];
        grouped[s.category].push(s);
    });

    let html = '';
    for (const [cat, list] of Object.entries(grouped)) {
        if (list.length === 0) continue;
        html += `
            <div class="category-block" id="cat-${cat.replace(/\s/g, '')}">
                <div class="category-title">${escapeHtml(cat)}</div>
                <div class="sites-grid-full">
                    ${list.map(site => `
                        <div class="site-card-large" onclick="location.href='site-detail.html?id=${site.id}'">
                            <div class="site-icon">${getSiteIconHtml(site)}</div>
                            <div class="site-info">
                                <div class="name">${escapeHtml(site.name)}</div>
                                <div class="desc">${escapeHtml(site.description || '')}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (!html) html = '<p style="text-align:center;color:var(--text-secondary);padding:40px;">暂无网址</p>';
    container.innerHTML = html;
}

function filterSitesByCategory(cat) {
    if (cat === 'all') {
        renderSitesContent('all');
        return;
    }
    renderSitesContent(cat);
    // 滚动到对应分类
    setTimeout(() => {
        const el = document.getElementById('cat-' + cat.replace(/\s/g, ''));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
}

function initSiteSearch() {
    const input = document.getElementById('siteSearch');
    if (!input) return;
    input.addEventListener('input', () => {
        const keyword = input.value.trim().toLowerCase();
        const sites = getData(STORAGE_KEYS.SITES);
        const filtered = sites.filter(s =>
            s.name.toLowerCase().includes(keyword) ||
            s.description?.toLowerCase().includes(keyword) ||
            (s.keywords || []).some(k => k.toLowerCase().includes(keyword)) ||
            (s.tags || []).some(t => t.toLowerCase().includes(keyword))
        );
        const container = document.getElementById('sitesContent');
        if (!container) return;

        if (!keyword) {
            renderSitesContent('all');
            return;
        }

        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:40px;">未找到相关网站</p>';
            return;
        }

        container.innerHTML = `
            <div class="category-block">
                <div class="category-title">搜索结果 (${filtered.length})</div>
                <div class="sites-grid-full">
                    ${filtered.map(site => `
                        <div class="site-card-large" onclick="location.href='site-detail.html?id=${site.id}'">
                            <div class="site-icon">${getSiteIconHtml(site)}</div>
                            <div class="site-info">
                                <div class="name">${escapeHtml(site.name)}</div>
                                <div class="desc">${escapeHtml(site.description || '')}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
}

// ========== 网址详情页 ==========
function loadSiteDetail() {
    initDefaultData();
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    const sites = getData(STORAGE_KEYS.SITES);
    const site = sites.find(s => s.id === id);
    if (!site) return;

    document.getElementById('siteName').textContent = site.name;
    document.getElementById('siteDesc').textContent = site.description || '';
    document.getElementById('siteIcon').innerHTML = getSiteIconHtml(site, true);
    document.getElementById('mainLink').href = site.url;
    document.getElementById('siteCategory').textContent = site.category;
    document.getElementById('siteTags').textContent = (site.tags || []).join('、') || '无';
    document.getElementById('siteKeywords').textContent = (site.keywords || []).join('、') || '无';
    document.title = site.name + ' - 网址详情';

    const backupContainer = document.getElementById('backupLinks');
    if (site.backupUrls && site.backupUrls.length > 0) {
        backupContainer.innerHTML = site.backupUrls.map((url, i) =>
            `<a href="${url}" target="_blank">备用链接 ${i + 1}</a>`
        ).join('');
    }
}

// ========== 工具函数 ==========
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}

function countWords(text) {
    if (!text) return 0;
    // 移除 markdown 标记后统计
    const plain = text.replace(/[#*`_\[\]()>-]/g, '').replace(/\s+/g, '');
    return plain.length;
}

function getSiteIconHtml(site, large = false) {
    if (site.icon) {
        return `<img src="${site.icon}" alt="${escapeHtml(site.name)}" onerror="this.parentNode.innerHTML='${site.name.charAt(0)}'">`;
    }
    return site.name.charAt(0);
}

// 页面加载时自动执行
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('postsList') && document.getElementById('sitesWidget')) {
        renderHomePage();
    }
});
