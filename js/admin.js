const STORAGE_POSTS = "blog_post_data";
const STORAGE_CAT_POST = "blog_post_category";
const STORAGE_CAT_SITE = "blog_site_category";
const STORAGE_SITES = "blog_site_data";

function getStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}
function setStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// 生成唯一ID
function createId() {
  return Date.now().toString() + Math.floor(Math.random()*999);
}
// 统计markdown纯文字数
function countMdText(str) {
  return str.replace(/[#*!()\[\]_`\-\n\r]/g,"").replace(/\s+/g,"").length;
}

// 切换后台标签页
function switchAdminTab(tabName) {
  document.querySelectorAll(".admin-tab").forEach(t=>t.classList.remove("active"));
  document.querySelector(`.admin-tab[data-tab="${tabName}"]`).classList.add("active");
  document.querySelectorAll(".admin-panel").forEach(p=>p.style.display="none");
  document.getElementById(`panel-${tabName}`).style.display="block";
}

// ========== 文章分类管理 ==========
function renderPostCat() {
  const cats = getStorage(STORAGE_CAT_POST);
  const box = document.getElementById("post-cat-list");
  box.innerHTML = "";
  cats.forEach((item,idx)=>{
    const div = document.createElement("div");
    div.className = "list-item-admin";
    div.innerHTML = `
      <span>${item}</span>
      <button class="btn btn-danger" onclick="delPostCat(${idx})">删除</button>
    `;
    box.appendChild(div);
  })
  // 下拉选择框同步更新
  const select = document.getElementById("post-category-select");
  select.innerHTML = "";
  cats.forEach(c=> select.innerHTML += `<option value="${c}">${c}</option>`)
}
function addPostCat() {
  const input = document.getElementById("new-post-cat");
  const val = input.value.trim();
  if(!val) return alert("分类名称不能为空");
  const arr = getStorage(STORAGE_CAT_POST);
  if(arr.includes(val)) return alert("该分类已存在");
  arr.push(val);
  setStorage(STORAGE_CAT_POST, arr);
  input.value = "";
  renderPostCat();
}
function delPostCat(idx) {
  const arr = getStorage(STORAGE_CAT_POST);
  arr.splice(idx,1);
  setStorage(STORAGE_CAT_POST, arr);
  renderPostCat();
}

// ========== 导航网站分类管理 ==========
function renderSiteCat() {
  const cats = getStorage(STORAGE_CAT_SITE);
  const box = document.getElementById("site-cat-list");
  box.innerHTML = "";
  cats.forEach((item,idx)=>{
    const div = document.createElement("div");
    div.className = "list-item-admin";
    div.innerHTML = `
      <span>${item}</span>
      <button class="btn btn-danger" onclick="delSiteCat(${idx})">删除</button>
    `;
    box.appendChild(div);
  })
  const select = document.getElementById("site-category-select");
  select.innerHTML = "";
  cats.forEach(c=> select.innerHTML += `<option value="${c}">${c}</option>`)
}
function addSiteCat() {
  const input = document.getElementById("new-site-cat");
  const val = input.value.trim();
  if(!val) return alert("分类名称不能为空");
  const arr = getStorage(STORAGE_CAT_SITE);
  if(arr.includes(val)) return alert("分类已存在");
  arr.push(val);
  setStorage(STORAGE_CAT_SITE, arr);
  input.value = "";
  renderSiteCat();
}
function delSiteCat(idx) {
  const arr = getStorage(STORAGE_CAT_SITE);
  arr.splice(idx,1);
  setStorage(STORAGE_CAT_SITE, arr);
  renderSiteCat();
}

// ========== 文章发布/编辑 ==========
let editPostId = null;
function submitPost() {
  const title = document.getElementById("post-title").value.trim();
  const desc = document.getElementById("post-desc").value.trim();
  const content = document.getElementById("post-md").value;
  const category = document.getElementById("post-category-select").value;
  const tagStr = document.getElementById("post-tags").value.trim();
  const top = document.getElementById("post-top").checked;
  if(!title || !desc || !content) return alert("标题、摘要、文章内容不能为空");
  const tags = tagStr.split(/[,，]/).map(t=>t.trim()).filter(t=>t);
  const wordCount = countMdText(content);
  const now = new Date().toLocaleString();
  const posts = getStorage(STORAGE_POSTS);
  if(editPostId) {
    // 编辑已有文章
    const idx = posts.findIndex(p=>p.id === editPostId);
    posts[idx] = {
      ...posts[idx],
      title, desc, content, category, tags, top, wordCount, updateTime: now
    }
    alert("文章修改完成");
  } else {
    // 新建文章
    const newPost = {
      id: createId(),
      title, desc, content, category, tags, top, wordCount,
      createTime: now, updateTime: now
    }
    posts.unshift(newPost);
    alert("文章发布成功");
  }
  setStorage(STORAGE_POSTS, posts);
  resetPostForm();
  renderAllPostManage();
}
function resetPostForm() {
  editPostId = null;
  document.getElementById("post-title").value = "";
  document.getElementById("post-desc").value = "";
  document.getElementById("post-md").value = "";
  document.getElementById("post-tags").value = "";
  document.getElementById("post-top").checked = false;
  document.getElementById("edit-post-id").innerText = "";
}
function renderAllPostManage() {
  const posts = getStorage(STORAGE_POSTS);
  const box = document.getElementById("post-manage-list");
  box.innerHTML = "";
  posts.forEach(p=>{
    const div = document.createElement("div");
    div.className = "list-item-admin";
    div.innerHTML = `
      <div>
        <div style="font-weight:500;">${p.title}</div>
        <div style="font-size:13px;color:#666;">分类：${p.category} | 字数：${p.wordCount} | 修改：${p.updateTime} ${p.top?"【置顶】":""}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-outline" onclick="editPost('${p.id}')">编辑</button>
        <button class="btn btn-danger" onclick="delPost('${p.id}')">删除</button>
      </div>
    `;
    box.appendChild(div);
  })
}
function editPost(id) {
  const posts = getStorage(STORAGE_POSTS);
  const p = posts.find(x=>x.id===id);
  if(!p) return;
  editPostId = id;
  document.getElementById("edit-post-id").innerText = "正在编辑文章ID："+id;
  document.getElementById("post-title").value = p.title;
  document.getElementById("post-desc").value = p.desc;
  document.getElementById("post-md").value = p.content;
  document.getElementById("post-category-select").value = p.category;
  document.getElementById("post-tags").value = p.tags.join("，");
  document.getElementById("post-top").checked = p.top;
  switchAdminTab("write-post");
}
function delPost(id) {
  if(!confirm("确定删除该文章？删除后无法恢复")) return;
  const arr = getStorage(STORAGE_POSTS).filter(p=>p.id!==id);
  setStorage(STORAGE_POSTS, arr);
  renderAllPostManage();
}

// ========== 导航网站新增/编辑 ==========
let editSiteId = null;
function addBackupLink() {
  const wrap = document.getElementById("backup-link-wrap");
  const div = document.createElement("div");
  div.style.display="flex;gap:8px;margin-top:8px;";
  div.innerHTML = `<input class="form-input backup-input" placeholder="备用链接"><button class="btn btn-danger" onclick="this.parentElement.remove()">移除</button>`;
  wrap.appendChild(div);
}
function submitSite() {
  const name = document.getElementById("site-name").value.trim();
  const desc = document.getElementById("site-desc").value.trim();
  const link = document.getElementById("site-main-link").value.trim();
  const icon = document.getElementById("site-icon").value.trim();
  const category = document.getElementById("site-category-select").value;
  const searchKey = document.getElementById("site-search-key").value.trim();
  if(!name || !desc || !link) return alert("名称、简介、主链接不能为空");
  // 收集所有备用链接
  const backupArr = [];
  document.querySelectorAll(".backup-input").forEach(inp=>{
    const val = inp.value.trim();
    if(val) backupArr.push(val);
  })
  const sites = getStorage(STORAGE_SITES);
  if(editSiteId) {
    const idx = sites.findIndex(s=>s.id===editSiteId);
    sites[idx] = {
      ...sites[idx], name, desc, link, icon, category, searchKey, backup: backupArr
    }
    alert("网站信息修改完成");
  } else {
    const newSite = {
      id: createId(), name, desc, link, icon, category, searchKey, backup: backupArr
    }
    sites.push(newSite);
    alert("网站添加成功");
  }
  setStorage(STORAGE_SITES, sites);
  resetSiteForm();
  renderAllSiteManage();
}
function resetSiteForm() {
  editSiteId = null;
  document.getElementById("site-name").value = "";
  document.getElementById("site-desc").value = "";
  document.getElementById("site-main-link").value = "";
  document.getElementById("site-icon").value = "";
  document.getElementById("site-search-key").value = "";
  document.getElementById("backup-link-wrap").innerHTML = "";
  document.getElementById("edit-site-id").innerText = "";
}
function renderAllSiteManage() {
  const sites = getStorage(STORAGE_SITES);
  const box = document.getElementById("site-manage-list");
  box.innerHTML = "";
  sites.forEach(s=>{
    const div = document.createElement("div");
    div.className = "list-item-admin";
    div.innerHTML = `
      <div>
        <div style="font-weight:500;">${s.name}</div>
        <div style="font-size:13px;color:#666;">分类：${s.category} | 搜索关键词：${s.searchKey}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-outline" onclick="editSite('${s.id}')">编辑</button>
        <button class="btn btn-danger" onclick="delSite('${s.id}')">删除</button>
      </div>
    `;
    box.appendChild(div);
  })
}
function editSite(id) {
  const sites = getStorage(STORAGE_SITES);
  const s = sites.find(x=>x.id===id);
  if(!s) return;
  editSiteId = id;
  document.getElementById("edit-site-id").innerText = "编辑网站ID："+id;
  document.getElementById("site-name").value = s.name;
  document.getElementById("site-desc").value = s.desc;
  document.getElementById("site-main-link").value = s.link;
  document.getElementById("site-icon").value = s.icon||"";
  document.getElementById("site-category-select").value = s.category;
  document.getElementById("site-search-key").value = s.searchKey;
  // 填充备用链接
  const wrap = document.getElementById("backup-link-wrap");
  wrap.innerHTML = "";
  s.backup.forEach(url=>{
    const div = document.createElement("div");
    div.style.display="flex;gap:8px;margin-top:8px;";
    div.innerHTML = `<input class="form-input backup-input" value="${url}" placeholder="备用链接"><button class="btn btn-danger" onclick="this.parentElement.remove()">移除</button>`;
    wrap.appendChild(div);
  })
  switchAdminTab("add-site");
}
function delSite(id) {
  if(!confirm("确定删除该网站导航条目？")) return;
  const arr = getStorage(STORAGE_SITES).filter(s=>s.id!==id);
  setStorage(STORAGE_SITES, arr);
  renderAllSiteManage();
}

// 页面加载初始化后台所有列表
window.onload = ()=>{
  renderPostCat();
  renderSiteCat();
  renderAllPostManage();
  renderAllSiteManage();
}
