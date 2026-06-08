const API='/api';let currentUser=null,currentPostId=null;

const ICONS = {
  moon:    `<svg width="16" height="16" viewBox="0 0 24 24" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
  sun:     `<svg width="16" height="16" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  comment: `<svg width="14" height="14" viewBox="0 0 24 24" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  heart:   `<svg width="14" height="14" viewBox="0 0 24 24" stroke-width="2" class="icon-heart"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  eye:     `<svg width="14" height="14" viewBox="0 0 24 24" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  arrowLeft: `<svg width="16" height="16" viewBox="0 0 24 24" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  mail:    `<svg width="14" height="14" viewBox="0 0 24 24" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  cake:    `<svg width="14" height="14" viewBox="0 0 24 24" stroke-width="2"><path d="M20 21v-8a2 2 0 00-2-2H6a2 2 0 00-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><line x1="2" y1="21" x2="22" y2="21"/><path d="M7 8v3M12 8v3M17 8v3"/><path d="M7 5a1 1 0 112 0c0 1-1 1-1 2h2"/><path d="M12 5a1 1 0 112 0c0 1-1 1-1 2h2"/><path d="M17 5a1 1 0 112 0c0 1-1 1-1 2h2"/></svg>`,
  calendar:`<svg width="14" height="14" viewBox="0 0 24 24" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  book:    `<svg width="14" height="14" viewBox="0 0 24 24" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>`,
  edit:    `<svg width="14" height="14" viewBox="0 0 24 24" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  lock:    `<svg width="14" height="14" viewBox="0 0 24 24" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`,
  fileText:`<svg width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
};

function saveAuth(d){localStorage.setItem('accessToken',d.accessToken);localStorage.setItem('refreshToken',d.refreshToken);if(d.user)localStorage.setItem('user',JSON.stringify(d.user));}
function getToken(){return localStorage.getItem('accessToken');}
function getSavedUser(){try{return JSON.parse(localStorage.getItem('user'));}catch{return null;}}
function clearAuth(){localStorage.removeItem('accessToken');localStorage.removeItem('refreshToken');localStorage.removeItem('user');}

function toggleTheme(){
  const dark=document.body.classList.toggle('dark');
  localStorage.setItem('theme',dark?'dark':'light');
  document.getElementById('themeToggle').innerHTML=dark?ICONS.sun:ICONS.moon;
}
function initTheme(){
  const s=localStorage.getItem('theme');
  const pd=window.matchMedia('(prefers-color-scheme: dark)').matches;
  if(s==='dark'||((!s)&&pd)){
    document.body.classList.add('dark');
    document.getElementById('themeToggle').innerHTML=ICONS.sun;
  } else {
    document.getElementById('themeToggle').innerHTML=ICONS.moon;
  }
}

window.onload=()=>{
  initTheme();
  const t=getToken(),u=getSavedUser();
  if(t&&u){currentUser=u;setLoggedIn(u);}
  loadPosts();
  showPage('homePage');
};

function setLoggedIn(u){
  document.getElementById('navGuest').style.display='none';
  document.getElementById('navUser').style.display='flex';
  document.getElementById('navUsername').style.display='inline';
  document.getElementById('navUsername').textContent=u.username||u.name;
  document.getElementById('sidebarProfile').style.display='block';
  document.getElementById('sidebarName').textContent=u.name||u.username;
  document.getElementById('sidebarRole').textContent=u.role||'Member';
  const sa=document.getElementById('sidebarAvatar');
  if(u.avatar_url){sa.innerHTML=`<img src="${u.avatar_url}" alt="av" onerror="this.parentElement.textContent='${(u.name||u.username||'?')[0].toUpperCase()}'" />`;}
  else{sa.textContent=(u.name||u.username||'?')[0].toUpperCase();}
  loadSidebarStats();
  initSocket();
  loadNotifBadge();
  updateDmBadge();
}

function setLoggedOut(){
  document.getElementById('navGuest').style.display='flex';
  document.getElementById('navUser').style.display='none';
  document.getElementById('navUsername').style.display='none';
  document.getElementById('sidebarProfile').style.display='none';
  currentUser=null;
}

function logout(){
  disconnectSocket();
  clearAuth();
  setLoggedOut();
  showPage('authPage');
  toast('Logged out successfully');
}

function goHome(){showPage('homePage');loadPosts();}

async function loadSidebarStats(){
  if(!currentUser)return;
  try{
    const[pr,vr]=await Promise.all([api('/posts'),api('/users/me/views')]);
    const mp=(pr.data||[]).filter(p=>{const a=p.author||{};return a._id===currentUser._id||a._id===currentUser.id;});
    document.getElementById('statViews').textContent=vr.data?.totalViews??'0';
    document.getElementById('statPosts').textContent=mp.length;
    document.getElementById('sidebarStats').style.display='flex';
  }catch{}
}

function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');window.scrollTo(0,0);}
function switchAuthTab(tab){document.getElementById('signinForm').style.display=tab==='signin'?'block':'none';document.getElementById('signupForm').style.display=tab==='signup'?'block':'none';document.getElementById('tabSignin').classList.toggle('active',tab==='signin');document.getElementById('tabSignup').classList.toggle('active',tab==='signup');}

function toast(msg,type='success'){const t=document.getElementById('toast');t.textContent=msg;t.className=`toast show ${type}`;setTimeout(()=>t.classList.remove('show'),3000);}

async function api(path,opts={}){
  const h={...(opts.headers||{})};
  if(!(opts.body instanceof FormData))h['Content-Type']='application/json';
  const t=getToken();if(t)h['Authorization']=`Bearer ${t}`;
  const r=await fetch(API+path,{...opts,headers:h,credentials:'include'});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.message||'Something went wrong');
  return d;
}

async function doLogin(){
  const btn=document.getElementById('signinBtn'),errEl=document.getElementById('signinError');
  errEl.classList.remove('show');
  const username=document.getElementById('loginUsername').value.trim(),password=document.getElementById('loginPassword').value;
  if(!username||!password){showErr(errEl,'Please fill in all fields');return;}
  btn.innerHTML='<span class="spinner"></span> Signing in…';btn.disabled=true;
  try{
    const res=await api('/blog/signin',{method:'POST',body:JSON.stringify({username,password})});
    saveAuth(res.data);const user=res.data.user||{username};localStorage.setItem('user',JSON.stringify(user));
    currentUser=user;setLoggedIn(user);toast('Welcome back, '+(user.name||username)+'!');showPage('homePage');loadPosts();
  }catch(e){showErr(errEl,e.message);}
  finally{btn.innerHTML='Sign in';btn.disabled=false;}
}

async function doRegister(){
  const btn=document.getElementById('signupBtn'),errEl=document.getElementById('signupError');
  errEl.classList.remove('show');
  const name=document.getElementById('regName').value.trim(),age=parseInt(document.getElementById('regAge').value),username=document.getElementById('regUsername').value.trim(),email=document.getElementById('regEmail').value.trim(),password=document.getElementById('regPassword').value;
  if(!name||!age||!username||!email||!password){showErr(errEl,'Please fill in all fields');return;}
  btn.innerHTML='<span class="spinner"></span> Creating account…';btn.disabled=true;
  try{
    const res=await api('/blog/signup',{method:'POST',body:JSON.stringify({name,age,username,email,password})});
    saveAuth(res.data);const user=res.data.user||{name,username,email};localStorage.setItem('user',JSON.stringify(user));
    currentUser=user;setLoggedIn(user);toast('Account created! Welcome, '+name+'!');showPage('homePage');loadPosts();
  }catch(e){showErr(errEl,e.message);}
  finally{btn.innerHTML='Create account';btn.disabled=false;}
}

async function doForgotPassword(){
  const btn=document.getElementById('forgotBtn'),errEl=document.getElementById('forgotError'),succEl=document.getElementById('forgotSuccess');
  errEl.classList.remove('show');succEl.classList.remove('show');
  const email=document.getElementById('forgotEmail').value.trim();
  if(!email){showErr(errEl,'Please enter your email');return;}
  btn.innerHTML='<span class="spinner"></span> Sending…';btn.disabled=true;
  try{await api('/blog/forgot-password',{method:'POST',body:JSON.stringify({email})});succEl.textContent='Reset link sent! Check your email inbox.';succEl.classList.add('show');}
  catch(e){showErr(errEl,e.message);}
  finally{btn.innerHTML='Send reset link';btn.disabled=false;}
}

async function doResetPassword(){
  const btn=document.getElementById('resetBtn'),errEl=document.getElementById('resetError'),succEl=document.getElementById('resetSuccess');
  errEl.classList.remove('show');succEl.classList.remove('show');
  const userId=document.getElementById('resetUserId').value.trim(),password=document.getElementById('resetPassword').value;
  if(!userId||!password){showErr(errEl,'Please fill in all fields');return;}
  btn.innerHTML='<span class="spinner"></span> Resetting…';btn.disabled=true;
  try{
    await api(`/blog/reset-password?userId=${userId}`,{method:'POST',body:JSON.stringify({password})});
    succEl.textContent='Password reset! You can now sign in.';succEl.classList.add('show');
    setTimeout(()=>showPage('authPage'),2000);
  }catch(e){showErr(errEl,e.message);}
  finally{btn.innerHTML='Reset password';btn.disabled=false;}
}

async function loadPosts(){
  const feed=document.getElementById('postsFeed');
  try{
    const res=await api('/posts?sort='+(currentSort||'latest'));const posts=res.data||[];
    if(posts.length===0){
      feed.innerHTML=`<div class="empty-state"><svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"/><polyline points="17 2 17 8 11 8"/></svg><p>No posts yet. Be the first to write one!</p></div>`;
      return;
    }
    feed.innerHTML=posts.map(p=>renderPostCard(p)).join('');
    setTimeout(loadCardViews,100);
  }catch(e){feed.innerHTML=`<div class="empty-state"><p style="color:var(--danger)">${e.message}</p></div>`;}
}

function renderPostCard(post){
  const a=post.author||{},
    init=(a.name||a.username||'A')[0].toUpperCase(),
    date=post.createdAt?new Date(post.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'',
    isOwner=currentUser&&(a._id===currentUser._id||a._id===currentUser.id),
    isAdmin=currentUser&&currentUser.role==='ADMIN',
    avHtml=a.avatar_url
      ?`<div class="avatar"><img src="${a.avatar_url}" alt="${init}" onerror="this.parentElement.textContent='${init}'" /></div>`
      :`<div class="avatar">${init}</div>`;
  return`<div class="post-card" onclick="openPost('${post._id}')">
    ${post.image_url?`<img class="post-card-image" src="${post.image_url}" alt="${escHtml(post.title)}" onerror="this.style.display='none'" />`:''}
    <div class="post-card-meta">${avHtml}<div class="post-author-info"><div class="author-name">${a.name||a.username||'Unknown'}</div><div class="post-date">${date}</div></div></div>
    <h2>${escHtml(post.title)}</h2><p>${escHtml(post.content)}</p>
    <div class="post-card-footer" onclick="event.stopPropagation()">
      <div class="post-stats">
        <button class="stat-btn" onclick="openPost('${post._id}')">${ICONS.comment} Comments</button>
        <button class="stat-btn" id="like-${post._id}" onclick="likePost('${post._id}',this)">${ICONS.heart} Like</button>
        <span class="stat-btn" id="views-card-${post._id}" style="cursor:default">${ICONS.eye} —</span>
      </div>
      <div class="post-actions">${(isOwner||isAdmin)?`<button class="btn btn-danger" onclick="deletePost('${post._id}',this)">Delete</button>`:''}</div>
    </div>
  </div>`;
}

async function loadCardViews(){
  const cards=document.querySelectorAll('[id^="views-card-"]');
  for(const el of cards){
    const pid=el.id.replace('views-card-','');
    try{const r=await api(`/posts/${pid}/views`);el.innerHTML=`${ICONS.eye} ${r.data.views}`;}catch{}
  }
}

async function openPost(id){
  currentPostId=id;showPage('postPage');
  const content=document.getElementById('postDetailContent');
  content.innerHTML=`<div class="empty-state"><span class="spinner spinner-dark"></span></div>`;
  if(currentUser){api(`/posts/${id}/view`,{method:'POST'}).catch(()=>{});}
  try{
    const[pr,cr,vr]=await Promise.all([api(`/posts/${id}`),api(`/posts/${id}/comments`),api(`/posts/${id}/views`)]);
    const post=pr.data,comments=cr.data||[],views=vr.data?.views??0,
      a=post.author||{},init=(a.name||a.username||'A')[0].toUpperCase(),
      date=post.createdAt?new Date(post.createdAt).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}):'',
      isOwner=currentUser&&(a._id===currentUser._id||a._id===currentUser.id),
      isAdmin=currentUser&&currentUser.role==='ADMIN',
      avHtml=a.avatar_url
        ?`<div class="avatar" style="width:40px;height:40px;font-size:15px"><img src="${a.avatar_url}" alt="${init}" onerror="this.parentElement.textContent='${init}'" /></div>`
        :`<div class="avatar" style="width:40px;height:40px;font-size:15px">${init}</div>`;
    content.innerHTML=`
      <div class="post-detail-header">
        <h1>${escHtml(post.title)}</h1>
        <div class="post-detail-meta">
          ${avHtml}
          <div><div style="font-size:14px;font-weight:500">${a.name||a.username||'Unknown'}</div><div style="font-size:12px;color:var(--muted)">${date}</div></div>
          <span style="font-size:13px;color:var(--muted);margin-left:8px;display:inline-flex;align-items:center;gap:4px">${ICONS.eye} ${views} views</span>
          ${(isOwner||isAdmin)?`<button class="btn btn-danger" style="margin-left:auto" onclick="deletePost('${post._id}',this,true)">Delete post</button>`:''}
        </div>
      </div>
      ${post.image_url?`<img class="post-detail-image" src="${post.image_url}" alt="${escHtml(post.title)}" onerror="this.style.display='none'" />`:''}
      <div class="post-detail-body">${escHtml(post.content)}</div>
      <hr class="divider" />
      <div class="comments-section">
        <h3>Comments (${comments.length})</h3>
        ${currentUser
          ?`<div class="add-comment"><h4>Leave a comment</h4><textarea id="commentText" placeholder="Share your thoughts..." rows="3" style="width:100%;"></textarea><button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="doComment('${post._id}')">Post comment</button></div>`
          :`<p style="font-size:14px;color:var(--muted);margin-bottom:20px"><a onclick="showPage('authPage')" style="color:var(--accent);cursor:pointer">Sign in</a> to leave a comment</p>`}
        <div id="commentsList">${comments.length===0?'<p style="color:var(--muted);font-size:14px">No comments yet. Be the first!</p>':comments.map(c=>renderComment(c)).join('')}</div>
      </div>`;
  }catch(e){content.innerHTML=`<p style="color:var(--danger)">${e.message}</p>`;}
}

function renderComment(c){
  const a=c.author||{},
    date=c.createdAt?new Date(c.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'',
    isOwner=currentUser&&(a._id===currentUser._id||a._id===currentUser.id),
    isAdmin=currentUser&&currentUser.role==='ADMIN';
  return`<div class="comment-card" id="comment-${c._id}"><div class="comment-meta"><span class="comment-author">${a.name||a.username||'Anonymous'}</span><div style="display:flex;align-items:center;gap:8px"><span class="comment-date">${date}</span>${(isOwner||isAdmin)?`<button class="btn btn-danger" style="padding:3px 10px;font-size:12px" onclick="deleteComment('${c._id}')">Delete</button>`:''}</div></div><p class="comment-text">${escHtml(c.text)}</p></div>`;
}

async function doComment(postId){
  const text=document.getElementById('commentText').value.trim();if(!text)return;
  try{
    const res=await api(`/posts/${postId}/comments`,{method:'POST',body:JSON.stringify({text})});
    document.getElementById('commentText').value='';
    const list=document.getElementById('commentsList');
    if(list.querySelector('p'))list.innerHTML='';
    list.insertAdjacentHTML('afterbegin',renderComment(res.data));toast('Comment posted!');
  }catch(e){toast(e.message,'error');}
}

async function deleteComment(id){
  if(!confirm('Delete this comment?'))return;
  try{await api(`/posts/comments/${id}`,{method:'DELETE'});document.getElementById('comment-'+id)?.remove();toast('Comment deleted');}
  catch(e){toast(e.message,'error');}
}

async function likePost(postId,btn){
  if(!currentUser){showPage('authPage');return;}
  try{
    await api(`/posts/${postId}/likes`,{method:'POST'});
    btn.classList.add('liked');
    btn.innerHTML=`${ICONS.heart} Liked`;
    toast('Post liked!');
  }catch(e){toast(e.message,'error');}
}

async function deletePost(id,btn,isDetail=false){
  if(!confirm('Delete this post? This cannot be undone.'))return;
  btn.disabled=true;btn.textContent='Deleting…';
  try{await api(`/posts/${id}`,{method:'DELETE'});toast('Post deleted');goHome();}
  catch(e){toast(e.message,'error');btn.disabled=false;btn.textContent='Delete';}
}

async function doCreatePost(){
  const btn=document.getElementById('createBtn'),errEl=document.getElementById('createError');
  errEl.classList.remove('show');
  const title=document.getElementById('newTitle').value.trim(),content=document.getElementById('newContent').value.trim(),imgFile=document.getElementById('newImage').files[0];
  if(!title||!content){showErr(errEl,'Title and content are required');return;}
  btn.innerHTML='<span class="spinner"></span> Publishing…';btn.disabled=true;
  try{
    const fd=new FormData();fd.append('title',title);fd.append('content',content);if(imgFile)fd.append('image',imgFile);
    const res=await fetch(API+'/posts',{method:'POST',headers:{'Authorization':`Bearer ${getToken()}`},body:fd,credentials:'include'});
    const data=await res.json();if(!res.ok)throw new Error(data.message||'Failed to create post');
    document.getElementById('newTitle').value='';document.getElementById('newContent').value='';document.getElementById('newImage').value='';
    toast('Post published!');goHome();
  }catch(e){showErr(errEl,e.message);}
  finally{btn.innerHTML='Publish post';btn.disabled=false;}
}

async function loadProfile(){
  if(!currentUser){showPage('authPage');return;}
  const uid=currentUser._id||currentUser.id;
  try{
    const res=await api(`/users/${uid}`);const u=res.data;
    currentUser={...currentUser,...u};localStorage.setItem('user',JSON.stringify(currentUser));
    const el=document.getElementById('profileAvatarBig');
    if(u.avatar_url){el.innerHTML=`<img src="${u.avatar_url}" alt="avatar" onerror="this.parentElement.textContent='${(u.name||'?')[0].toUpperCase()}'" />`;}
    else{el.textContent=(u.name||u.username||'?')[0].toUpperCase();}
    document.getElementById('profileName').textContent=u.name||u.username;
    document.getElementById('profileUsername').textContent='@'+u.username;
    document.getElementById('profileEmail').innerHTML=`${ICONS.mail} ${escHtml(u.email||'—')}`;
    document.getElementById('profileAge').innerHTML=`${ICONS.cake} Age ${escHtml(String(u.age||'—'))}`;
    document.getElementById('profileJoined').innerHTML=`${ICONS.calendar} Joined ${u.createdAt?new Date(u.createdAt).toLocaleDateString('en-US',{month:'short',year:'numeric'}):'—'}`;
    document.getElementById('profileRoleBadge').innerHTML=u.role==='ADMIN'?'<span class="tag">Admin</span>':'';
    document.getElementById('editName').value=u.name||'';
    document.getElementById('editAge').value=u.age||'';
    document.getElementById('editEmail').value=u.email||'';
    const ep=document.getElementById('editAvatarPreview');
    if(u.avatar_url){ep.innerHTML=`<img src="${u.avatar_url}" alt="avatar" />`;}else{ep.textContent=(u.name||'?')[0].toUpperCase();}
  }catch(e){toast(e.message,'error');}
  loadViewsHistory();
}

async function loadViewsHistory(){
  const el=document.getElementById('viewsHistory');
  try{
    const res=await api('/users/me/views');const views=res.data?.views||[];
    if(views.length===0){
      el.innerHTML=`<div class="empty-state"><svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><p>No posts viewed yet.<br>Start reading to build your history.</p></div>`;
      return;
    }
    el.innerHTML=`<p style="font-size:13px;color:var(--muted);margin-bottom:16px">${views.length} post${views.length!==1?'s':''} viewed</p>`
      +views.map(v=>{
        const post=v.post||{},
          time=v.viewedAt?new Date(v.viewedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}):'',
          thumb=post.image_url
            ?`<img class="view-thumb" src="${post.image_url}" alt="" onerror="this.style.display='none'" />`
            :`<div class="view-thumb-placeholder">${ICONS.fileText}</div>`;
        return`<div class="view-item" onclick="openPost('${post._id}')">
          ${thumb}
          <div>
            <div class="view-title">${escHtml(post.title||'Untitled')}</div>
            <div class="view-time">${ICONS.eye} Viewed on ${time}</div>
          </div>
        </div>`;
      }).join('');
  }catch(e){el.innerHTML=`<p style="color:var(--danger);font-size:14px">${e.message}</p>`;}
}

function switchProfileTab(tab){
  ['views','edit','password'].forEach(t=>{
    const cap=t.charAt(0).toUpperCase()+t.slice(1);
    document.getElementById('profileTab'+cap).style.display=t===tab?'block':'none';
    document.getElementById('ptab'+cap).classList.toggle('active',t===tab);
  });
}

function previewAvatar(input){
  const f=input.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=e=>{document.getElementById('editAvatarPreview').innerHTML=`<img src="${e.target.result}" alt="preview" />`;};
  r.readAsDataURL(f);
}

async function doUpdateProfile(){
  const btn=document.getElementById('editBtn'),errEl=document.getElementById('editError'),succEl=document.getElementById('editSuccess');
  errEl.classList.remove('show');succEl.classList.remove('show');
  const uid=currentUser._id||currentUser.id;
  btn.innerHTML='<span class="spinner"></span> Saving…';btn.disabled=true;
  try{
    const fd=new FormData();fd.append('name',document.getElementById('editName').value.trim());fd.append('age',document.getElementById('editAge').value);fd.append('email',document.getElementById('editEmail').value.trim());
    const af=document.getElementById('editAvatar').files[0];if(af)fd.append('image',af);
    const res=await fetch(API+`/users/${uid}`,{method:'PUT',headers:{'Authorization':`Bearer ${getToken()}`},body:fd,credentials:'include'});
    const data=await res.json();if(!res.ok)throw new Error(data.message||'Update failed');
    currentUser={...currentUser,...data.data};localStorage.setItem('user',JSON.stringify(currentUser));
    setLoggedIn(currentUser);succEl.textContent='Profile updated successfully!';succEl.classList.add('show');toast('Profile updated!');loadProfile();
  }catch(e){showErr(errEl,e.message);}
  finally{btn.innerHTML='Save changes';btn.disabled=false;}
}

async function doChangePassword(){
  const btn=document.getElementById('passBtn'),errEl=document.getElementById('passError'),succEl=document.getElementById('passSuccess');
  errEl.classList.remove('show');succEl.classList.remove('show');
  const np=document.getElementById('newPassword').value,cp=document.getElementById('confirmPassword').value;
  if(!np||!cp){showErr(errEl,'Please fill in both fields');return;}
  if(np!==cp){showErr(errEl,'Passwords do not match');return;}
  if(np.length<6){showErr(errEl,'Password must be at least 6 characters');return;}
  btn.innerHTML='<span class="spinner"></span> Updating…';btn.disabled=true;
  try{
    const uid=currentUser._id||currentUser.id;
    await api(`/users/${uid}/change-password`,{method:'PATCH',body:JSON.stringify({password:np})});
    succEl.textContent='Password updated successfully!';succEl.classList.add('show');
    document.getElementById('newPassword').value='';document.getElementById('confirmPassword').value='';toast('Password updated!');
  }catch(e){showErr(errEl,e.message);}
  finally{btn.innerHTML='Update password';btn.disabled=false;}
}

function showErr(el,msg){el.textContent=msg;el.classList.add('show');}
function escHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

let currentSort = 'latest';
function setSortAndLoad(sort){
  currentSort=sort;
  ['Latest','Oldest','Popular'].forEach(s=>{
    const el=document.getElementById('sort'+s);
    if(el)el.classList.toggle('active',s.toLowerCase()===sort);
  });
  loadPosts();
}

let _searchTimer=null;
function onUserSearch(val){
  const box=document.getElementById('searchResults');
  clearTimeout(_searchTimer);
  if(!val.trim()){box.style.display='none';return;}
  _searchTimer=setTimeout(async()=>{
    try{
      const res=await api('/users/search?q='+encodeURIComponent(val.trim()));
      const users=res.data||[];
      if(!users.length){box.style.display='none';return;}
      box.innerHTML=users.map(u=>{
        const init=(u.name||u.username||'?')[0].toUpperCase();
        const av=u.avatar_url
          ?`<div class="avatar" style="width:32px;height:32px;font-size:12px"><img src="${u.avatar_url}" onerror="this.parentElement.textContent='${init}'" /></div>`
          :`<div class="avatar" style="width:32px;height:32px;font-size:12px">${init}</div>`;
        return`<div class="search-result-item" onclick="openUserPage('${u._id}')">
          ${av}
          <div>
            <div class="search-result-name">${escHtml(u.name||u.username)}</div>
            <div class="search-result-username">@${escHtml(u.username)}</div>
          </div>
        </div>`;
      }).join('');
      box.style.display='block';
    }catch{box.style.display='none';}
  },300);
}

document.addEventListener('click',e=>{
  if(!e.target.closest('.search-bar-wrap')){
    const box=document.getElementById('searchResults');
    if(box)box.style.display='none';
  }
});

async function openUserPage(userId){
  const myId=currentUser?._id||currentUser?.id;
  if(currentUser&&userId===myId){showPage('profilePage');loadProfile();return;}
  showPage('userPage');
  const content=document.getElementById('userPageContent');
  content.innerHTML=`<div class="empty-state"><span class="spinner spinner-dark"></span></div>`;
  const box=document.getElementById('searchResults');
  if(box)box.style.display='none';
  const inp=document.getElementById('userSearchInput');
  if(inp)inp.value='';
  try{
    const[ur,pr,followerRes,followingRes]=await Promise.all([
      api(`/users/${userId}`),
      api('/posts'),
      api(`/users/${userId}/followers`),
      api(`/users/${userId}/following`),
    ]);
    const u=ur.data;
    const userPosts=(pr.data||[]).filter(p=>{const a=p.author||{};return a._id===userId||a.id===userId;});
    const followers=followerRes.data||[];
    const following=followingRes.data||[];
    let isFollowing=false;
    if(currentUser){isFollowing=followers.some(f=>(f._id||f.id)===(myId));}
    const init=(u.name||u.username||'?')[0].toUpperCase();
    const av=u.avatar_url
      ?`<div class="profile-avatar-big"><img src="${u.avatar_url}" onerror="this.textContent='${init}'" /></div>`
      :`<div class="profile-avatar-big">${init}</div>`;
    const followBtn=currentUser
      ?`<button class="btn ${isFollowing?'btn-ghost':'btn-primary'} btn-sm follow-btn" id="followBtn" onclick="toggleFollow('${userId}',${isFollowing})">${isFollowing?'Unfollow':'Follow'}</button>`
      :'';
    const msgBtn=currentUser
      ?`<button class="btn btn-ghost btn-sm" style="margin-left:8px" onclick="openDmFromProfile('${userId}')">💬 Message</button>`
      :'';
    content.innerHTML=`
      <div class="user-profile-header">
        ${av}
        <div class="user-profile-info">
          <h2>${escHtml(u.name||u.username)}</h2>
          <div style="color:var(--muted);font-size:14px">@${escHtml(u.username)}</div>
          <div class="user-profile-meta">
            <span>Age ${u.age||'—'}</span>
            <span>Joined ${u.createdAt?new Date(u.createdAt).toLocaleDateString('en-US',{month:'short',year:'numeric'}):'—'}</span>
          </div>
          <div class="follow-stats">
            <div class="follow-stat"><strong>${followers.length}</strong> Followers</div>
            <div class="follow-stat"><strong>${following.length}</strong> Following</div>
            <div class="follow-stat"><strong>${userPosts.length}</strong> Posts</div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">${followBtn}${msgBtn}</div>
        </div>
      </div>
      <h3 style="font-family:'Lora',serif;font-size:18px;font-weight:600;margin-bottom:16px">Posts by ${escHtml(u.name||u.username)}</h3>
      <div class="user-posts-list">
        ${userPosts.length===0
          ?'<p style="color:var(--muted);font-size:14px">No posts yet.</p>'
          :userPosts.map(p=>renderPostCard(p)).join('')}
      </div>`;
  }catch(e){content.innerHTML=`<p style="color:var(--danger)">${e.message}</p>`;}
}

async function openDmFromProfile(userId){
  try{
    const ur=await api(`/users/${userId}`);
    openDm(userId,ur.data);
  }catch(e){toast(e.message,'error');}
}

async function toggleFollow(userId,isCurrentlyFollowing){
  if(!currentUser){showPage('authPage');return;}
  const btn=document.getElementById('followBtn');
  btn.disabled=true;
  try{
    if(isCurrentlyFollowing){
      await api(`/users/${userId}/unfollow`,{method:'DELETE'});
      btn.textContent='Follow';btn.className='btn btn-primary btn-sm follow-btn';
      btn.onclick=()=>toggleFollow(userId,false);toast('Unfollowed');
    }else{
      await api(`/users/${userId}/follow`,{method:'POST'});
      btn.textContent='Unfollow';btn.className='btn btn-ghost btn-sm follow-btn';
      btn.onclick=()=>toggleFollow(userId,true);toast('Followed!');
    }
  }catch(e){toast(e.message,'error');}
  finally{btn.disabled=false;}
}

let socket=null;
let currentDmUserId=null;
let replyingTo=null; // {_id, text, senderName}

const REACTIONS=['❤️','😂','😮','😢','👍','🔥'];

function initSocket(){
  if(socket)return;
  const token=getToken();
  if(!token)return;
  socket=io({auth:{token}});
  socket.on('connect',()=>console.log('🟢 Socket connected'));
  socket.on('connect_error',(err)=>console.warn('Socket error:',err.message));
  socket.on('chat:message',(msg)=>{
    const el=document.getElementById('globalMessages');
    if(el&&document.getElementById('globalChatPage').classList.contains('active')){
      appendGlobalMsg(msg,el);scrollChatBottom(el);
    }
  });
  socket.on('chat:deleted',({messageId})=>{
    document.getElementById('msg-'+messageId)?.remove();
  });
  socket.on('chat:reaction',({messageId,reactions})=>{
    updateMsgReactions(messageId,reactions);
  });
  socket.on('dm:message',(msg)=>{
    const senderId=msg.sender?._id||msg.sender;
    const receiverId=msg.receiver?._id||msg.receiver;
    const myId=currentUser?._id||currentUser?.id;
    if(document.getElementById('dmPage').classList.contains('active')&&currentDmUserId){
      const otherId=senderId===myId?receiverId:senderId;
      if(otherId===currentDmUserId||currentDmUserId===senderId||currentDmUserId===receiverId){
        const el=document.getElementById('dmMessages');
        if(el){appendDmMsg(msg,el);scrollChatBottom(el);}
        if(receiverId===myId)socket.emit('dm:seen',{senderId});
      }
    }
    updateDmBadge();
  });
  socket.on('dm:deleted',({messageId})=>{
    document.getElementById('msg-'+messageId)?.remove();
  });
  socket.on('dm:seen_ack',({receiverId,seenAt})=>{
    // Mark all my ticks as seen for that receiver
    document.querySelectorAll('.seen-tick:not(.seen)').forEach(tick=>{
      tick.textContent='✓✓';tick.classList.add('seen');tick.title='Seen';
    });
  });
  socket.on('notification',()=>loadNotifBadge());
}

function disconnectSocket(){
  if(socket){socket.disconnect();socket=null;}
}


async function loadGlobalChat(){
  initSocket();
  const el=document.getElementById('globalMessages');
  el.innerHTML='<div class="empty-state"><span class="spinner spinner-dark"></span></div>';
  try{
    const res=await api('/chat/messages?limit=60');
    const msgs=res.data||[];
    if(!msgs.length){el.innerHTML='<div class="empty-state"><p>No messages yet. Say hello! 👋</p></div>';return;}
    el.innerHTML='';
    let lastDate='';
    msgs.forEach(m=>{
      const d=new Date(m.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'});
      if(d!==lastDate){el.appendChild(dateDivider(d));lastDate=d;}
      appendGlobalMsg(m,el);
    });
    scrollChatBottom(el);
  }catch(e){el.innerHTML=`<div class="empty-state"><p style="color:var(--danger)">${e.message}</p></div>`;}
}

function sendGlobalMsg(){
  const inp=document.getElementById('globalMsgInput');
  const text=inp.value.trim();
  if(!text||!socket)return;
  const payload={text};
  if(replyingTo){payload.replyTo=replyingTo._id;}
  socket.emit('chat:send',payload);
  inp.value='';
  cancelReply();
}

function setReply(msgId,senderName,text){
  replyingTo={_id:msgId,senderName,text};
  const bar=document.getElementById('replyBar');
  if(!bar)return;
  bar.style.display='flex';
  document.getElementById('replyBarName').textContent=senderName;
  document.getElementById('replyBarText').textContent=text.length>60?text.slice(0,60)+'…':text;
  document.getElementById('globalMsgInput').focus();
}

function cancelReply(){
  replyingTo=null;
  const bar=document.getElementById('replyBar');
  if(bar)bar.style.display='none';
}

function buildReactionsHtml(reactions,msgId){
  if(!reactions||typeof reactions!=='object')return'';
  const entries=Object.entries(reactions).filter(([,users])=>users.length>0);
  if(!entries.length)return'';
  const myId=currentUser?._id||currentUser?.id;
  return`<div class="msg-reactions">${entries.map(([emoji,users])=>{
    const mine=users.includes(myId);
    return`<button class="reaction-chip${mine?' mine':''}" onclick="reactMsg('${msgId}','${emoji}')" title="${users.length} reaction${users.length>1?'s':''}">${emoji} ${users.length}</button>`;
  }).join('')}</div>`;
}

function reactMsg(msgId,emoji){
  if(!socket||!currentUser){showPage('authPage');return;}
  socket.emit('chat:react',{messageId:msgId,emoji});
}

function updateMsgReactions(msgId,reactions){
  const row=document.getElementById('msg-'+msgId);
  if(!row)return;
  let rc=row.querySelector('.msg-reactions');
  const newHtml=buildReactionsHtml(reactions,msgId);
  if(rc){rc.outerHTML=newHtml||'<div class="msg-reactions"></div>';}
  else{
    const wrap=row.querySelector('.msg-bubble-wrap');
    if(wrap&&newHtml)wrap.insertAdjacentHTML('beforeend',newHtml);
  }
}

function showReactionPicker(msgId,btnEl){
  document.querySelectorAll('.reaction-picker-popup').forEach(p=>p.remove());
  const popup=document.createElement('div');
  popup.className='reaction-picker-popup';
  popup.innerHTML=REACTIONS.map(e=>`<button onclick="reactMsg('${msgId}','${e}');this.closest('.reaction-picker-popup').remove()">${e}</button>`).join('');
  btnEl.parentElement.style.position='relative';
  btnEl.parentElement.appendChild(popup);
  setTimeout(()=>document.addEventListener('click',function h(ev){if(!popup.contains(ev.target)){popup.remove();document.removeEventListener('click',h);}},false),0);
}

function appendGlobalMsg(msg,container){
  const myId=currentUser?._id||currentUser?.id;
  const sender=msg.sender||{};
  const senderId=sender._id||sender;
  const isMine=senderId===myId;
  const init=(sender.name||sender.username||'?')[0].toUpperCase();
  const time=new Date(msg.createdAt||Date.now()).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});

  // Avatar — clickable (başqasiga profil ochish)
  const avInner=sender.avatar_url
    ?`<img src="${sender.avatar_url}" onerror="this.parentElement.textContent='${init}'" />`
    :init;
  const av=!isMine
    ?`<div class="msg-avatar clickable-avatar" onclick="openChatUserProfile('${senderId}')" title="View profile">${avInner}</div>`
    :'';

  const canDel=isMine||currentUser?.role==='ADMIN';
  const delBtn=canDel?`<button class="msg-delete-btn" onclick="deleteGlobalMsg('${msg._id}')" title="Delete">✕</button>`:'';
  const replyBtn=currentUser?`<button class="msg-reply-btn" onclick="setReply('${msg._id}','${escHtml(sender.name||sender.username||'')}','${escHtml(msg.text||'').replace(/'/g,"\\'")}')">↩</button>`:'';
  const emojiBtn=currentUser?`<button class="msg-emoji-btn" onclick="showReactionPicker('${msg._id}',this)">😊</button>`:'';

  // Reply preview
  let replyHtml='';
  if(msg.replyTo&&!msg.replyTo.isDeleted){
    const rt=msg.replyTo;
    const rtName=rt.sender?.name||rt.sender?.username||'Unknown';
    replyHtml=`<div class="msg-reply-preview"><span class="msg-reply-author">${escHtml(rtName)}</span><span class="msg-reply-text">${escHtml((rt.text||'').slice(0,60))}</span></div>`;
  }

  const reactions=msg.reactions||{};
  let reactObj={};
  if(reactions instanceof Map){reactions.forEach((v,k)=>{reactObj[k]=v;});}
  else{reactObj=reactions;}
  const reactHtml=buildReactionsHtml(reactObj,msg._id);

  const row=document.createElement('div');
  row.className=`msg-row ${isMine?'mine':'other'}`;
  row.id='msg-'+msg._id;
  row.innerHTML=`
    ${av}
    <div class="msg-bubble-wrap">
      ${!isMine?`<div class="msg-sender-name clickable-name" onclick="openChatUserProfile('${senderId}')">${escHtml(sender.name||sender.username||'')}</div>`:''}
      ${replyHtml}
      <div class="msg-bubble">${escHtml(msg.text)}</div>
      <div class="msg-meta">${time} ${replyBtn} ${emojiBtn} ${delBtn}</div>
      ${reactHtml}
    </div>`;
  container.appendChild(row);
}

async function deleteGlobalMsg(msgId){
  if(!confirm('Delete this message?'))return;
  try{await api('/chat/messages/'+msgId,{method:'DELETE'});document.getElementById('msg-'+msgId)?.remove();}
  catch(e){toast(e.message,'error');}
}

// Global chatdan profilni ochish (popup shaklida)
async function openChatUserProfile(userId){
  const myId=currentUser?._id||currentUser?.id;
  if(userId===myId){showPage('profilePage');loadProfile();return;}
  // Mavjud popupni o'chirish
  document.getElementById('chatProfilePopup')?.remove();

  const popup=document.createElement('div');
  popup.id='chatProfilePopup';
  popup.className='chat-profile-popup';
  popup.innerHTML=`<div class="cpp-inner"><span class="cpp-close" onclick="document.getElementById('chatProfilePopup').remove()">✕</span><div class="cpp-loading"><span class="spinner spinner-dark"></span></div></div>`;
  document.body.appendChild(popup);

  try{
    const[ur,followerRes]=await Promise.all([
      api(`/users/${userId}`),
      api(`/users/${userId}/followers`),
    ]);
    const u=ur.data;
    const followers=followerRes.data||[];
    const isFollowing=currentUser?followers.some(f=>(f._id||f.id)===myId):false;
    const init=(u.name||u.username||'?')[0].toUpperCase();
    const av=u.avatar_url
      ?`<div class="cpp-avatar"><img src="${u.avatar_url}" onerror="this.textContent='${init}'" /></div>`
      :`<div class="cpp-avatar">${init}</div>`;
    const followBtnHtml=currentUser
      ?`<button class="btn ${isFollowing?'btn-ghost':'btn-primary'} btn-sm" id="cppFollowBtn" onclick="toggleFollowFromChat('${userId}',${isFollowing})">${isFollowing?'Unfollow':'Follow'}</button>`
      :'';
    popup.querySelector('.cpp-inner').innerHTML=`
      <button class="cpp-close" onclick="document.getElementById('chatProfilePopup').remove()">✕</button>
      ${av}
      <div class="cpp-name">${escHtml(u.name||u.username)}</div>
      <div class="cpp-username">@${escHtml(u.username)}</div>
      <div class="cpp-stats"><span><strong>${followers.length}</strong> followers</span></div>
      <div class="cpp-actions">
        ${followBtnHtml}
        <button class="btn btn-ghost btn-sm" onclick="document.getElementById('chatProfilePopup').remove();openUserPage('${userId}')">View profile</button>
      </div>`;
  }catch(e){
    popup.querySelector('.cpp-inner').innerHTML=`<button class="cpp-close" onclick="document.getElementById('chatProfilePopup').remove()">✕</button><p style="color:var(--danger);padding:16px">${e.message}</p>`;
  }
}

async function toggleFollowFromChat(userId,isCurrentlyFollowing){
  if(!currentUser){showPage('authPage');return;}
  const btn=document.getElementById('cppFollowBtn');
  if(btn)btn.disabled=true;
  try{
    if(isCurrentlyFollowing){
      await api(`/users/${userId}/unfollow`,{method:'DELETE'});
      if(btn){btn.textContent='Follow';btn.className='btn btn-primary btn-sm';btn.onclick=()=>toggleFollowFromChat(userId,false);}
      toast('Unfollowed');
    }else{
      await api(`/users/${userId}/follow`,{method:'POST'});
      if(btn){btn.textContent='Unfollow';btn.className='btn btn-ghost btn-sm';btn.onclick=()=>toggleFollowFromChat(userId,true);}
      toast('Followed!');
    }
  }catch(e){toast(e.message,'error');}
  finally{if(btn)btn.disabled=false;}
}

function openInbox(){showPage('inboxPage');loadInbox();}

async function loadInbox(){
  initSocket();
  const el=document.getElementById('inboxList');
  el.innerHTML='<div class="empty-state"><span class="spinner spinner-dark"></span></div>';
  try{
    const res=await api('/chat/conversations');
    const convs=res.data||[];
    if(!convs.length){el.innerHTML='<div class="empty-state"><p>No messages yet.<br>Follow someone and start a conversation!</p></div>';return;}
    const myId=currentUser?._id||currentUser?.id;
    el.innerHTML='';
    convs.forEach(msg=>{
      const sender=msg.sender||{};
      const receiver=msg.receiver||{};
      const other=(sender._id||sender)===myId?receiver:sender;
      const otherId=other._id||other;
      const init=(other.name||other.username||'?')[0].toUpperCase();
      const av=other.avatar_url
        ?`<div class="inbox-avatar"><img src="${other.avatar_url}" onerror="this.parentElement.textContent='${init}'" /></div>`
        :`<div class="inbox-avatar">${init}</div>`;
      const time=msg.createdAt?timeAgo(msg.createdAt):'';
      const isUnread=(msg.receiver?._id||msg.receiver)===myId&&!msg.seenAt;
      const item=document.createElement('div');
      item.className=`inbox-item${isUnread?' unread':''}`;
      item.onclick=()=>openDm(otherId,other);
      item.innerHTML=`${av}
        <div class="inbox-info">
          <div class="inbox-name">${escHtml(other.name||other.username||'?')}</div>
          <div class="inbox-preview">${(msg.sender?._id||msg.sender)===myId?'You: ':''}${escHtml(msg.text)}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <span class="inbox-time">${time}</span>
          ${isUnread?'<span class="inbox-unread-dot"></span>':''}
        </div>`;
      el.appendChild(item);
    });
    updateDmBadge();
  }catch(e){el.innerHTML=`<div class="empty-state"><p style="color:var(--danger)">${e.message}</p></div>`;}
}

async function openDm(userId,userObj){
  initSocket();
  currentDmUserId=userId;
  showPage('dmPage');
  const headerEl=document.getElementById('dmHeaderUser');
  const init=(userObj?.name||userObj?.username||'?')[0].toUpperCase();
  const av=userObj?.avatar_url
    ?`<div class="dm-header-avatar"><img src="${userObj.avatar_url}" onerror="this.parentElement.textContent='${init}'" /></div>`
    :`<div class="dm-header-avatar">${init}</div>`;
  headerEl.innerHTML=`${av}
    <div>
      <div class="dm-header-name">${escHtml(userObj?.name||userObj?.username||'?')}</div>
      <div class="dm-header-username">@${escHtml(userObj?.username||'')}</div>
    </div>`;
  const msgEl=document.getElementById('dmMessages');
  msgEl.innerHTML='<div class="empty-state"><span class="spinner spinner-dark"></span></div>';
  try{
    const res=await api(`/chat/dm/${userId}?limit=60`);
    const msgs=res.data||[];
    if(!msgs.length){msgEl.innerHTML='<div class="empty-state"><p>No messages yet. Say something! 💬</p></div>';return;}
    msgEl.innerHTML='';
    let lastDate='';
    msgs.forEach(m=>{
      const d=new Date(m.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'});
      if(d!==lastDate){msgEl.appendChild(dateDivider(d));lastDate=d;}
      appendDmMsg(m,msgEl);
    });
    scrollChatBottom(msgEl);
    socket?.emit('dm:seen',{senderId:userId});
  }catch(e){msgEl.innerHTML=`<div class="empty-state"><p style="color:var(--danger)">${e.message}</p></div>`;}
}

function sendDM(){
  if(!socket)return;
  const inp=document.getElementById('dmMsgInput');
  const text=inp.value.trim();
  if(!text||!currentDmUserId)return;
  socket.emit('dm:send',{receiverId:currentDmUserId,text});
  inp.value='';
}

function appendDmMsg(msg,container){
  const myId=currentUser?._id||currentUser?.id;
  const senderId=msg.sender?._id||msg.sender;
  const isMine=senderId===myId;
  const sender=msg.sender||{};
  const init=(sender.name||sender.username||'?')[0].toUpperCase();
  const time=new Date(msg.createdAt||Date.now()).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
  const seen=msg.seenAt;
  const av=sender.avatar_url
    ?`<div class="msg-avatar"><img src="${sender.avatar_url}" onerror="this.parentElement.textContent='${init}'" /></div>`
    :`<div class="msg-avatar">${init}</div>`;
  const canDel=isMine||currentUser?.role==='ADMIN';
  const delBtn=canDel?`<button class="msg-delete-btn" onclick="deleteDmMsg('${msg._id}')" title="Delete">✕</button>`:'';
  const seenHtml=isMine
    ?`<span class="seen-tick${seen?' seen':''}" title="${seen?'Seen':'Sent'}">${seen?'✓✓':'✓'}</span>`
    :'';
  const row=document.createElement('div');
  row.className=`msg-row ${isMine?'mine':'other'}`;
  row.id='msg-'+msg._id;
  row.innerHTML=`
    ${!isMine?av:''}
    <div class="msg-bubble-wrap">
      <div class="msg-bubble">${escHtml(msg.text)}</div>
      <div class="msg-meta">${time} ${seenHtml} ${delBtn}</div>
    </div>`;
  container.appendChild(row);
}

async function deleteDmMsg(msgId){
  if(!confirm('Delete this message?'))return;
  try{await api('/chat/dm/'+msgId,{method:'DELETE'});document.getElementById('msg-'+msgId)?.remove();toast('Message deleted');}
  catch(e){toast(e.message,'error');}
}

function openNotifications(){showPage('notificationsPage');loadNotifications();}

async function loadNotifications(){
  const el=document.getElementById('notifList');
  el.innerHTML='<div class="empty-state"><span class="spinner spinner-dark"></span></div>';
  try{
    const res=await api('/notifications');
    const notifs=res.data||[];
    if(!notifs.length){el.innerHTML='<div class="empty-state"><p>No notifications yet.</p></div>';updateNotifBadge(0);return;}
    el.innerHTML='';
    const unreadCount=notifs.filter(n=>!n.isRead).length;
    updateNotifBadge(unreadCount);
    notifs.forEach(n=>{
      const item=document.createElement('div');
      item.className=`notif-item${n.isRead?'':' unread'}`;
      item.onclick=async()=>{
        if(!n.isRead){try{await api(`/notifications/${n._id}/read`,{method:'PATCH'});}catch{}item.classList.remove('unread');}
        if(n.post)openPost(n.post);
      };
      const iconType=n.type==='like'?'like':n.type==='comment'?'comment':'follow';
      const time=n.createdAt?timeAgo(n.createdAt):'';
      item.innerHTML=`
        <div class="notif-icon ${iconType}">${notifIcon(iconType)}</div>
        <div class="notif-content">
          <div class="notif-text">${formatNotifText(n)}</div>
          <div class="notif-time">${time}</div>
        </div>
        ${!n.isRead?'<div class="notif-unread-dot"></div>':''}`;
      el.appendChild(item);
    });
  }catch(e){el.innerHTML=`<div class="empty-state"><p style="color:var(--danger)">${e.message}</p></div>`;}
}

function formatNotifText(n){
  const who=`<strong>${escHtml(n.fromUser?.name||n.fromUser?.username||'Someone')}</strong>`;
  if(n.type==='like')return`${who} liked your post`;
  if(n.type==='comment')return`${who} commented on your post`;
  if(n.type==='follow')return`${who} started following you`;
  return escHtml(n.message||'New notification');
}

function notifIcon(type){
  if(type==='like')return`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`;
  if(type==='comment')return`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`;
  return`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`;
}

async function markAllNotifsRead(){
  try{
    await api('/notifications/read-all',{method:'PATCH'});
    document.querySelectorAll('.notif-item.unread').forEach(el=>el.classList.remove('unread'));
    document.querySelectorAll('.notif-unread-dot').forEach(el=>el.remove());
    updateNotifBadge(0);toast('All notifications marked as read');
  }catch(e){toast(e.message,'error');}
}

async function loadNotifBadge(){
  if(!currentUser)return;
  try{const res=await api('/notifications/unread-count');updateNotifBadge(res.data?.count||0);}catch{}
}

function updateNotifBadge(count){
  const el=document.getElementById('notifBadge');
  if(!el)return;
  if(count>0){el.style.display='flex';el.textContent=count>99?'99+':count;}
  else{el.style.display='none';}
}

async function updateDmBadge(){
  if(!currentUser)return;
  try{
    const res=await api('/chat/conversations');
    const myId=currentUser?._id||currentUser?.id;
    const unread=(res.data||[]).filter(m=>(m.receiver?._id||m.receiver)===myId&&!m.seenAt).length;
    const el=document.getElementById('dmBadge');
    if(!el)return;
    if(unread>0){el.style.display='flex';el.textContent=unread>99?'99+':unread;}
    else{el.style.display='none';}
  }catch{}
}

function scrollChatBottom(el){setTimeout(()=>{el.scrollTop=el.scrollHeight;},50);}

function dateDivider(label){
  const d=document.createElement('div');
  d.className='date-divider';d.textContent=label;return d;
}

function timeAgo(dateStr){
  const diff=Date.now()-new Date(dateStr).getTime();
  const mins=Math.floor(diff/60000);
  if(mins<1)return'now';
  if(mins<60)return`${mins}m`;
  const hrs=Math.floor(mins/60);
  if(hrs<24)return`${hrs}h`;
  const days=Math.floor(hrs/24);
  if(days<7)return`${days}d`;
  return new Date(dateStr).toLocaleDateString('en-US',{month:'short',day:'numeric'});
}