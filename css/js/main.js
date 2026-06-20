// 本地存储key常量
const STORAGE_POSTS = "blog_post_data";
const STORAGE_CAT_POST = "blog_post_category";
const STORAGE_CAT_SITE = "blog_site_category";
const STORAGE_SITES = "blog_site_data";

// 初始化默认分类（预设，后台可增删）
function initDefaultData() {
  if (!localStorage.getItem(STORAGE_CAT_POST)) {
    localStorage.setItem(STORAGE_CAT_POST, JSON.stringify(["随笔", "技术教程", "生活记录", "资源分享"]));
  }
  if (!localStorage.getItem(STORAGE_CAT_SITE)) {
    localStorage.setItem(STORAGE_CAT_SITE, JSON.stringify(["NAS服务", "工具网站", "学习资源", "影音娱乐"]));
  }
  if (!localStorage.getItem(STORAGE_POSTS)) localStorage.setItem(STORAGE_POSTS, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_SITES)) localStorage.setItem(STORAGE_SITES, JSON.stringify([]));
}
initDefaultData();

// 读取存储工具
function getStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}
function setStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// 全局搜索匹配函数
function globalSearch(keyword) {
  const posts = getStorage(STORAGE_POSTS);
  const sites = getStorage(STORAGE_SITES);
  const resPost = [];
  const resSite = [];
  const kw = keyword.toLowerCase().trim();
  if (!kw) return { posts: posts.slice(0,6), sites: sites.slice(0,10) };
  // 匹配文章：标题/摘要/标签/分类
  posts.forEach(p => {
    const match = p.title.toLowerCase().includes(kw)
      || p.desc.toLowerCase().includes(kw)
      || p.tags.some(t=>t.toLowerCase().includes(kw))
      || p.category.toLowerCase().includes(kw);
    if(match) resPost.push(p);
  })
  // 匹配导航：名称/简介/关键词/分类
  sites.forEach(s => {
    const match = s.name.toLowerCase().includes(kw)
      || s.desc.toLowerCase().includes(kw)
      || s.searchKey.toLowerCase().includes(kw)
      || s.category.toLowerCase().includes(kw);
    if(match) resSite.push(s);
  })
  return { posts: resPost, sites: resSite };
}

// 渲染首页内容
function renderHome() {
  const posts = getStorage(STORAGE_POSTS);
  const sites = getStorage(STORAGE_SITES);
  // 置顶优先排序
  const sortPost = [...posts].sort((a,b)=> (b.top?1:0)-(a.top?1:0));
  const postBox = document.getElementById("home-post-list");
  const siteBox = document.getElementById("home-site-list");
  postBox.innerHTML = "";
  siteBox.innerHTML = "";
  // 渲染文章列表（首页6条）
  sortPost.slice(0,6).forEach(p=>{
    const div = document.createElement("div");
    div.className = "card fade-wrap";
    div.innerHTML = `
      <h3 class="card-title">${p.title}</h3>
      <p class="card-desc">${p.desc}</p>
      <div class="tag-wrap">
        <span class="tag">${p.category}</span>
        ${p.tags.map(t=>`<span class="tag">${t}</span>`).join("")}
      </div>
      <div style="margin-top:12px;">
        <a href="post.html?id=${p.id}" class="more-btn">阅读全文 →</a>
      </div>
    `;
    postBox.appendChild(div);
  })
  // 渲染导航（首页8个）
  sites.slice(0,8).forEach(s=>{
    const div = document.createElement("div");
    div.className = "card fade-wrap";
    div.innerHTML = `
      <div class="site-card">
        <img class="site-icon" src="${s.icon||''}" alt="">
        <div class="site-info">
          <h4>${s.name}</h4>
          <p>${s.desc}</p>
        </div>
      </div>
      <a href="post3.html?id=${s.id}" class="more-btn" style="margin-top:10px;">查看详情</a>
    `;
    siteBox.appendChild(div);
  })
}

// 页面加载执行渲染
window.onload = ()=>{
  renderHome();
  // 搜索监听
  const searchInput = document.getElementById("global-search");
  if(searchInput){
    searchInput.addEventListener("input", (e)=>{
      const data = globalSearch(e.target.value);
      renderSearchResult(data);
    })
  }
}

// 搜索结果渲染（首页弹窗替换）
function renderSearchResult(data) {
  const postBox = document.getElementById("home-post-list");
  const siteBox = document.getElementById("home-site-list");
  postBox.innerHTML = "";
  siteBox.innerHTML = "";
  data.posts.forEach(p=>{
    const div = document.createElement("div");
    div.className = "card fade-wrap";
    div.innerHTML = `
      <h3 class="card-title">${p.title}</h3>
      <p class="card-desc">${p.desc}</p>
      <div class="tag-wrap">
        <span class="tag">${p.category}</span>
        ${p.tags.map(t=>`<span class="tag">${t}</span>`).join("")}
      </div>
      <div style="margin-top:12px;">
        <a href="post.html?id=${p.id}" class="more-btn">阅读全文 →</a>
      </div>
    `;
    postBox.appendChild(div);
  })
  data.sites.forEach(s=>{
    const div = document.createElement("div");
    div.className = "card fade-wrap";
    div.innerHTML = `
      <div class="site-card">
        <img class="site-icon" src="${s.icon||''}" alt="">
        <div class="site-info">
          <h4>${s.name}</h4>
          <p>${s.desc}</p>
        </div>
      </div>
      <a href="post3.html?id=${s.id}" class="more-btn" style="margin-top:10px;">查看详情</a>
    `;
    siteBox.appendChild(div);
  })
}

// 获取url参数工具
function getUrlParam(name) {
  const url = new URL(location.href);
  return url.searchParams.get(name);
}
