let editingPostId = null;
let editingSiteId = null;
let backupLinksCount = 0;

// 初始化后台
document.addEventListener('DOMContentLoaded', () => {
    initDefaultData();
    initTabs();
    renderPostsAdmin();
    renderSitesAdmin();
    renderCategoryLists();
    bindEvents();
    updateCategorySelects();
});

// 标签页切换
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(tab + 'Tab').classList.add('active');
        });
    });
}

function bindEvents() {
    document.getElementById('newPostBtn').addEventListener('click', () => openPostEditor());
    document.getElementById('newSiteBtn').addEventListener('click', () => openSiteEditor());
    
    // 实时字数统计
    const contentInput = document.getElementById('postContentInput');
    if (contentInput) {
        contentInput.addEventListener('input', () => {
            document.getElementById('wordCount').textContent = countWords(contentInput.value);
        });
    }
}

// ========== 文章管理 ==========
function openPostEditor(id = null) {
    editingPostId = id;
    const panel = document.getElementById('postEditor');
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth' });

    if (id) {
        const posts = getData(STORAGE_KEYS.POSTS);
        const post = posts.find(p => p.id === id);
        if (post) {
            document.getElementById('editorTitle').textContent = '编辑文章';
            document.getElementById('postTitleInput').value = post.title;
            document.getElementById('postSummaryInput').value = post.summary || '';
            document.getElementById('postContentInput').value = post.content;
            document.getElementById('postTagsInput').value = (post.tags || []).join(',');
            document.getElementById('postTopCheck').checked = post.top || false;
            document.getElementById('wordCount').textContent = countWords(post.content);
            updateCategorySelects();
            document.getElementById('postCategorySelect').value = post.category;
        }
    } else {
        document.getElementById('editorTitle').textContent = '新建文章';
        document.getElementById('postTitleInput').value = '';
        document.getElementById('postSummaryInput').value = '';
        document.getElementById('postContentInput').value = '';
        document.getElementById('postTagsInput').value = '';
        document.getElementById('postTopCheck').checked
