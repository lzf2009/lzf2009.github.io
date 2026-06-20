// 后台管理功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化编辑器
    const simplemde = new SimpleMDE({
        element: document.getElementById("postContentEditor"),
        spellChecker: false,
        autosave: {
            enabled: true,
            uniqueId: "blogPostContent",
            delay: 1000,
        },
        toolbar: [
            "bold", "italic", "heading", "|",
            "quote", "unordered-list", "ordered-list", "|",
            "link", "image", "code", "table", "|",
            "preview", "side-by-side", "fullscreen", "|",
            "guide"
        ]
    });

    // 获取DOM元素
    const newPostBtn = document.getElementById('newPostBtn');
    const managePostsBtn = document.getElementById('managePostsBtn');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const editorSection = document.getElementById('editorSection');
    const postsListSection = document.getElementById('postsListSection');
    const previewSection = document.getElementById('previewSection');
    const savePostBtn = document.getElementById('savePostBtn');
    const previewPostBtn = document.getElementById('previewPostBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const backToEditBtn = document.getElementById('backToEditBtn');
    const postsTableBody = document.getElementById('postsTableBody');
    const filterPosts = document.getElementById('filterPosts');
    const filterCategory = document.getElementById('filterCategory');
    const logoutBtn = document.getElementById('logoutBtn');

    // 当前编辑的文章ID（null表示新建）
    let currentEditPostId = null;

    // 初始化页面
    loadPostsTable();

    // 切换到新建文章
    newPostBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(editorSection);
        setActiveNav(this);
        clearForm();
        currentEditPostId = null;
    });

    // 切换到管理文章
    managePostsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(postsListSection);
        setActiveNav(this);
        loadPostsTable();
    });

    // 导出数据
    exportDataBtn.addEventListener('click', function(e) {
        e.preventDefault();
        exportBlogData();
    });

    // 保存文章
    savePostBtn.addEventListener('click', function() {
        savePost();
    });

    // 预览文章
    previewPostBtn.addEventListener('click', function() {
        previewPost();
    });

    // 清空表单
    clearFormBtn.addEventListener('click', function() {
        clearForm();
    });

    // 返回编辑
    backToEditBtn.addEventListener('click', function() {
        showSection(editorSection);
    });

    // 筛选文章
    filterPosts.addEventListener('input', function() {
        loadPostsTable();
    });

    filterCategory.addEventListener('change', function() {
        loadPostsTable();
    });

    // 退出管理
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('确定要退出管理吗？未保存的内容可能会丢失。')) {
            window.location.href = 'index.html';
        }
    });

    // 显示指定区域
    function showSection(section) {
        editorSection.style.display = 'none';
        postsListSection.style.display = 'none';
        previewSection.style.display = 'none';
        section.style.display = 'block';
    }

    // 设置活动导航
    function setActiveNav(navElement) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });
        navElement.classList.add('active');
    }

    // 清空表单
    function clearForm() {
        document.getElementById('postTitle').value = '';
        document.getElementById('postCategory').value = 'tech';
        document.getElementById('postTags').value = '';
        document.getElementById('postExcerpt').value = '';
        simplemde.value('');
        currentEditPostId = null;
    }

    // 保存文章
    function savePost() {
        const title = document.getElementById('postTitle').value.trim();
        const category = document.getElementById('postCategory').value;
        const tags = document.getElementById('postTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const excerpt = document.getElementById('postExcerpt').value.trim();
        const content = simplemde.value().trim();

        // 验证必填字段
        if (!title) {
            alert('请输入文章标题');
            document.getElementById('postTitle').focus();
            return;
        }

        if (!excerpt) {
            alert('请输入文章摘要');
            document.getElementById('postExcerpt').focus();
            return;
        }

        if (!content) {
            alert('请输入文章内容');
            simplemde.codemirror.focus();
            return;
        }

        // 准备文章数据
        const postData = {
            title,
            category,
            tags,
            excerpt,
            content
        };

        // 更新或新增文章
        if (currentEditPostId) {
            blogManager.updatePost(currentEditPostId, postData);
            alert('文章更新成功！');
        } else {
            const newPost = blogManager.addPost(postData);
            currentEditPostId = newPost.id;
            alert('文章保存成功！');
        }

        // 刷新文章列表
        loadPostsTable();
    }

    // 预览文章
    function previewPost() {
        const title = document.getElementById('postTitle').value.trim() || '无标题';
        const category = document.getElementById('postCategory').value;
        const tags = document.getElementById('postTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const content = simplemde.value().trim() || '暂无内容';
        const excerpt = document.getElementById('postExcerpt').value.trim() || '暂无摘要';

        // 设置预览内容
        document.getElementById('previewTitle').textContent = title;
        document.getElementById('previewCategory').innerHTML = `<i class="fas fa-folder"></i> ${blogManager.getCategoryName(category)}`;
        document.getElementById('previewDate').innerHTML = `<i class="far fa-calendar-alt"></i> ${new Date().toLocaleDateString('zh-CN')}`;
        document.getElementById('previewTags').innerHTML = `<i class="fas fa-tags"></i> ${tags.join(', ') || '无标签'}`;
        
        // 使用marked解析Markdown
        document.getElementById('previewContent').innerHTML = marked.parse(content);

        // 显示预览区域
        showSection(previewSection);
    }

    // 加载文章表格
    function loadPostsTable() {
        const filterText = filterPosts.value.toLowerCase();
        const filterCat = filterCategory.value;
        const posts = blogManager.getAllPosts();
        
        // 筛选文章
        let filteredPosts = posts;
        
        if (filterText) {
            filteredPosts = filteredPosts.filter(post => 
                post.title.toLowerCase().includes(filterText) ||
                post.excerpt.toLowerCase().includes(filterText) ||
                post.tags.some(tag => tag.toLowerCase().includes(filterText))
            );
        }
        
        if (filterCat) {
            filteredPosts = filteredPosts.filter(post => post.category === filterCat);
        }
        
        // 按日期排序（最新的在前）
        filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // 生成表格行
        if (filteredPosts.length === 0) {
            postsTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 2rem; color: #999;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        暂无文章
                    </td>
                </tr>
            `;
        } else {
            postsTableBody.innerHTML = filteredPosts.map(post => `
                <tr>
                    <td>${post.title}</td>
                    <td>${blogManager.getCategoryName(post.category)}</td>
                    <td>${new Date(post.date).toLocaleDateString('zh-CN')}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editPost(${post.id})">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="action-btn delete-btn" onclick="deletePost(${post.id})">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    // 编辑文章（全局函数，供onclick调用）
    window.editPost = function(postId) {
        const post = blogManager.getPostById(postId);
        if (!post) return;
        
        // 填充表单
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postCategory').value = post.category;
        document.getElementById('postTags').value = post.tags.join(', ');
        document.getElementById('postExcerpt').value = post.excerpt;
        simplemde.value(post.content);
        
        // 设置当前编辑的文章ID
        currentEditPostId = postId;
        
        // 切换到编辑区域
        showSection(editorSection);
        setActiveNav(newPostBtn);
        
        // 滚动到顶部
        window.scrollTo(0, 0);
    };

    // 删除文章（全局函数，供onclick调用）
    window.deletePost = function(postId) {
        if (confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
            if (blogManager.deletePost(postId)) {
                alert('文章已删除');
                loadPostsTable();
                
                // 如果正在编辑被删除的文章，清空表单
                if (currentEditPostId === postId) {
                    clearForm();
                }
            }
        }
    };

    // 导出博客数据
    function exportBlogData() {
        const posts = blogManager.getAllPosts();
        const dataStr = JSON.stringify(posts, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `blog-backup-${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        alert(`已导出 ${posts.length} 篇文章的数据`);
    }

    // 初始化时显示编辑器
    showSection(editorSection);
});
