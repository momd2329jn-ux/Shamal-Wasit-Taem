document.addEventListener('DOMContentLoaded',()=>{
  const b=document.getElementById('menuButton');
  const n=document.getElementById('mainNav');

  if(b&&n)b.addEventListener('click',()=>{
    n.classList.toggle('open');
    b.setAttribute('aria-expanded',n.classList.contains('open')?'true':'false');
  });

  if(n)n.addEventListener('click',e=>{
    if(e.target.closest('a'))n.classList.remove('open');
  });

  const applyNav=async(user)=>{
    if(!n)return;

    const authLink=n.querySelector('[data-nav="auth"]');
    const member=n.querySelector('[data-nav="member"]');
    const admin=n.querySelector('[data-nav="admin"]');

    const signedUser=!!user && user.isAnonymous!==true;

    // الزائر يرى تسجيل الدخول، أما العضو والمدير والمشرف فيرون حسابي.
    if(authLink){
      authLink.hidden=signedUser;
      authLink.textContent='تسجيل الدخول';
      authLink.setAttribute('href','login.html');
    }
    if(member){
      member.hidden=!signedUser;
      member.setAttribute('href','member.html');
      member.textContent='حسابي';
    }
    if(admin)admin.hidden=true;

    if(!signedUser)return;

    try{
      if(window.db){
        const snap=await db.collection('users').doc(user.uid).get();
        if(snap.exists){
          const role=String(snap.data().role||'').trim().toLowerCase();
          if(admin)admin.hidden=!['admin','supervisor'].includes(role);
        }
      }
    }catch(e){
      console.warn('تعذر التحقق من صلاحية لوحة التحكم',e);
    }
  };

  if(window.auth)auth.onAuthStateChanged(applyNav);

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
});
