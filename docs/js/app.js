document.addEventListener('DOMContentLoaded',()=>{
 const b=document.getElementById('menuButton'),n=document.getElementById('mainNav');
 if(b&&n)b.addEventListener('click',()=>{n.classList.toggle('open');b.setAttribute('aria-expanded',n.classList.contains('open')?'true':'false');});
 if(n)n.addEventListener('click',e=>{if(e.target.closest('a'))n.classList.remove('open');});
 const eb=document.getElementById('enableNotifications');
 if(eb&&window.WasitNotifications)eb.addEventListener('click',async()=>{
   const result=await WasitNotifications.requestBrowserPermission();
   if(result==='granted'){eb.textContent='✓ إشعارات الجهاز مفعّلة';eb.disabled=true;}
   else if(result==='denied')eb.textContent='الإشعارات محظورة من المتصفح';
   else eb.textContent='المتصفح لا يدعم الإشعارات';
 });
 if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
});

(function setupAdminNav(){
 function remove(){document.querySelectorAll('#mainNav a[data-admin-nav]').forEach(a=>a.remove());}
 function add(){const nav=document.getElementById('mainNav');if(!nav||nav.querySelector('[data-admin-nav]'))return;const a=document.createElement('a');a.href='admin.html';a.dataset.adminNav='true';a.textContent='لوحة التحكم';nav.appendChild(a);}
 function check(user){
   if(!user||user.isAnonymous||!window.db){remove();return;}
   db.collection('users').doc(user.uid).get().then(s=>{
     const d=s.exists?(s.data()||{}):{},role=String(d.role||'user').trim().toLowerCase(),perms=Array.isArray(d.permissions)?d.permissions:[];
     const ok=role==='admin'||(role==='supervisor'&&perms.length>0);
     ok?add():remove();
   }).catch(err=>{console.error('ADMIN NAV:',err);remove();});
 }
 if(window.auth&&window.db)auth.onAuthStateChanged(check);else remove();
})();