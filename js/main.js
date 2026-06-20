// 博客数据管理
class BlogManager {
    constructor() {
        this.posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        this.currentPostId = null;
        this.init();
    }

    init() {
        // 如果是文章详情页
        if (window.location.pathname.includes('post.html')) {
            this.loadPostFromURL();
            this.setupPostNavigation();
        } else {
            // 首页
            this.renderPosts();
            this.setupSearch();
        }
    }

    // 从URL参数加载文章
    loadPostFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        
        if (postId) {
            this.currentPostId = parseInt(postId);
            this.renderPostDetail(this.currentPostId);
        } else {
            document.getElementById('postContent').innerHTML = `
                <div class="error-message">
                    <h2>文章未找到</h2>
                    <p>请检查链接是否正确，或<a href="index.html">返回首页</a>。</p>
                </div>
            `;
        }
    }

    // 渲染文章详情
    renderPostDetail(postId) {
        const post = this.posts.find(p => p.id === postId);
        const container = document.getElementById('postContent');
        
        if (!post) {
            container.innerHTML = `
                <div class="error-message">
                    <h2>文章未找到</h2>
                    <p>请检查链接是否正确，或<a href="index.html">返回首页</a>。</p>
                </div>
            `;
            return;
        }

        // 使用marked解析Markdown
        const contentHtml = marked.parse(post.content);
        
        container.innerHTML = `
            <h2>${post.title}</h2>
            <div class="post-meta">
                <span><i class="far fa-calendar-alt"></i> ${new Date(post.date).toLocaleDateString('zh-CN')}</span>
                <span><i class="fas fa-folder"></i> ${this.getCategoryName(post.category)}</span>
                <span><i class="fas fa-tag"></i> ${post.tags.join(', ')}</span>
            </div>
            <div class="post-content markdown-content">
                ${contentHtml}
            </div>
        `;
    }

    // 设置文章导航
    setupPostNavigation() {
        const prevBtn = document.getElementById('prevPost');
        const nextBtn = document.getElementById('nextPost');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const prevId = this.getAdjacentPostId(this.currentPostId, -1);
                if (prevId) {
                    window.location.href = `post.html?id=${prevId}`;
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const nextId = this.getAdjacentPostId(this.currentPostId, 1);
                if (nextId) {
                    window.location.href = `post.html?id=${nextId}`;
                }
            });
        }
    }

    // 获取相邻文章ID
    getAdjacentPostId(currentId, direction) {
        const sortedPosts = [...this.posts].sort((a, b) => new Date(b.date) - new Date(a.date));
        const currentIndex = sortedPosts.findIndex(p => p.id === currentId);
        
        if (currentIndex === -1) return null;
        
        const adjacentIndex = currentIndex + direction;
        if (adjacentIndex >= 0 && adjacentIndex < sortedPosts.length) {
            return sortedPosts[adjacentIndex].id;
        }
        
        return null;
    }

    // 渲染文章列表
    renderPosts(filter = '') {
        const container = document.getElementById('postsContainer');
        if (!container) return;
        
        let filteredPosts = this.posts;
        
        if (filter) {
            filter = filter.toLowerCase();
            filteredPosts = this.posts.filter(post => 
                post.title.toLowerCase().includes(filter) ||
                post.excerpt.toLowerCase().includes(filter) ||
                post.tags.some(tag => tag.toLowerCase().includes(filter)) ||
                this.getCategoryName(post.category).toLowerCase().includes(filter)
            );
        }
        
        // 按日期排序
        filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filteredPosts.length === 0) {
            container.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-inbox"></i>
                    <p>暂无文章${filter ? '，尝试其他关键词' : ''}</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredPosts.map(post => `
            <article class="post-card">
                <div class="post-content">
                    <h3>${post.title}</h3>
                    <div class="post-meta">
                        <span><i class="far fa-calendar-alt"></i> ${new Date(post.date).toLocaleDateString('zh-CN')}</span>
                        <span><i class="fas fa-folder"></i> ${this.getCategoryName(post.category)}</span>
                    </div>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <a href="post.html?id=${post.id}" class="read-more">阅读全文</a>
                </div>
            </article>
        `).join('');
    }

    // 设置搜索功能
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput && searchBtn) {
            const performSearch = () => {
                this.renderPosts(searchInput.value.trim());
            };
            
            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
    }

    // 获取分类名称
    getCategoryName(categoryKey) {
        const categories = {
            'tech': '技术',
            'tutorial': '教程',
            'note': '笔记',
            'life': '生活'
        };
        return categories[categoryKey] || categoryKey;
    }

    // 添加新文章
    addPost(postData) {
        const newId = this.posts.length > 0 ? Math.max(...this.posts.map(p => p.id)) + 1 : 1;
        const newPost = {
            id: newId,
            date: new Date().toISOString(),
            ...postData
        };
        
        this.posts.push(newPost);
        this.saveToLocalStorage();
        return newPost;
    }

    // 更新文章
    updatePost(id, postData) {
        const index = this.posts.findIndex(p => p.id === id);
        if (index !== -1) {
            this.posts[index] = { ...this.posts[index], ...postData };
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // 删除文章
    deletePost(id) {
        const index = this.posts.findIndex(p => p.id === id);
        if (index !== -1) {
            this.posts.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // 保存到本地存储
    saveToLocalStorage() {
        localStorage.setItem('blogPosts', JSON.stringify(this.posts));
    }

    // 获取所有文章
    getAllPosts() {
        return this.posts;
    }

    // 根据ID获取文章
    getPostById(id) {
        return this.posts.find(p => p.id === id);
    }
}

// 初始化博客管理器
const blogManager = new BlogManager();

// 添加示例文章（如果本地没有数据）
if (blogManager.getAllPosts().length === 0) {
    const samplePosts = [
        {
            title: "欢迎来到我的技术博客",
            category: "note",
            tags: ["博客", "欢迎", "技术"],
            excerpt: "这是我的第一篇博客文章，介绍了这个博客系统的功能和特点。",
            content: `# 欢迎来到我的技术博客

这是一个基于GitHub Pages的静态博客系统，具有以下特点：

## 主要功能

1. **响应式设计** - 适配各种屏幕尺寸
2. **Markdown支持** - 使用Markdown编写文章
3. **本地存储** - 文章数据保存在浏览器本地
4. **网址导航** - 内置常用开发资源链接
5. **后台管理** - 可视化文章编辑器

## 如何使用

1. 访问后台管理页面
2. 使用Markdown编辑器撰写文章
3. 保存后即可在前台查看
4. 数据会自动保存在浏览器中

## 技术栈

- HTML5 & CSS3
- JavaScript (ES6+)
- Marked.js (Markdown解析)
- SimpleMDE (编辑器)
- LocalStorage (数据存储)

这个博客完全部署在GitHub Pages上，无需服务器即可运行！`
        },
        {
            title: "GitHub Pages部署指南",
            category: "tutorial",
            tags: ["GitHub", "部署", "教程"],
            excerpt: "详细介绍如何将静态网站部署到GitHub Pages的完整流程。",
            content: `# GitHub Pages部署指南

GitHub Pages是GitHub提供的免费静态网站托管服务，非常适合部署个人博客、项目文档等静态网站。

## 部署步骤

### 1. 创建GitHub仓库

首先，在你的GitHub账号下创建一个新的仓库：
- 仓库名格式为 \`username.github.io\`（其中username是你的GitHub用户名）
- 设置为Public
- 勾选"Initialize this repository with a README"

### 2. 上传博客文件

将本项目的所有文件上传到仓库中：
- index.html
- post.html
- admin.html
- css/style.css
- js/main.js
- js/admin.js

### 3. 启用GitHub Pages

1. 进入仓库的Settings页面
2. 滚动到"Pages"部分
3. 在"Source"中选择"Deploy from a branch"
4. 选择"main"分支和"/ (root)"文件夹
5. 点击"Save"

### 4. 访问你的博客

等待几分钟后，你就可以通过以下地址访问你的博客：
\`https://username.github.io\`

## 自定义域名（可选）

如果你想使用自己的域名：
1. 在域名服务商处添加CNAME记录指向 \`username.github.io\`
2. 在GitHub Pages设置中添加自定义域名
3. 等待DNS生效

## 注意事项

- GitHub Pages有带宽和构建次数限制
- 免费版只能托管公开仓库
- 每次推送代码后需要等待1-2分钟才能生效

## 自动更新

你可以设置GitHub Actions来实现自动化部署，每次推送代码后自动构建和部署。

---

通过这个简单的指南，你应该已经成功部署了自己的博客！`
        },
        {
            title: "JavaScript ES6+ 新特性总结",
            category: "tech",
            tags: ["JavaScript", "ES6", "前端"],
            excerpt: "总结ES6及后续版本中最重要的JavaScript新特性。",
            content: `# JavaScript ES6+ 新特性总结

ES6（ECMAScript 2015）及后续版本为JavaScript带来了许多重要的新特性，极大地提升了开发效率和代码质量。

## 1. let和const

块级作用域变量声明：
\`\`\`javascript
let count = 0;
const PI = 3.14159;
\`\`\`

## 2. 箭头函数

更简洁的函数语法：
\`\`\`javascript
const add = (a, b) => a + b;
\`\`\`

## 3. 模板字符串

多行字符串和字符串插值：
\`\`\`javascript
const name = 'Alice';
console.log(\`Hello, \${name}!\`);
\`\`\`

## 4. 解构赋值

从数组或对象中提取值：
\`\`\`javascript
const [first, second] = [1, 2];
const { name, age } = person;
\`\`\`

## 5. 展开运算符

数组和对象的展开：
\`\`\`javascript
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4];
const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 };
\`\`\`

## 6. Promise

异步编程的新方案：
\`\`\`javascript
fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
\`\`\`

## 7. async/await

Promise的语法糖：
\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
\`\`\`

## 8. 模块化

原生的模块系统：
\`\`\`javascript
// 导出
export const add = (a, b) => a + b;
export default class Person {}

// 导入
import Person, { add } from './module.js';
\`\`\`

## 9. 类

面向对象的类语法：
\`\`\`javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(\`\${this.name} makes a noise.\`);
  }
}
\`\`\`

## 10. 可选链操作符

安全访问嵌套属性：
\`\`\`javascript
const street = user?.address?.street;
\`\`\`

## 总结

这些新特性使JavaScript变得更加强大和易用。建议在实际项目中逐步采用这些特性，并注意浏览器兼容性问题。

---

*持续学习，保持更新！*`
        }
    ];
    
    samplePosts.forEach(post => blogManager.addPost(post));
}
