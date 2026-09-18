document.addEventListener('DOMContentLoaded',()=>{
  const b=document.getElementById('menuButton');
  const n=document.getElementById('mainNav');
  if(!n)return;

  if(b)b.addEventListener('click',()=>{
    n.classList.toggle('open');
    b.setAttribute('aria-expanded',n.classList.contains('open')?'true':'false');
  });

  n.addEventListener('click',e=>{
    if(e.target.closest('a'))n.classList.remove('open');
  });

  const authLink=n.querySelector('[data-nav="auth"]');
  const member=n.querySelector('[data-nav="member"]');
  const admin=n.querySelector('[data-nav="admin"]');

  const setNav=(signed)=>{
    if(authLink){
      authLink.hidden=signed;
      authLink.textContent='تسجيل الدخول';
      authLink.href='login.html';
    }
    if(member){
      member.hidden=!signed;
      member.textContent='حسابي';
      member.href='member.html';
    }
    if(admin)admin.hidden=true;
  };

  const applyNav=async(user)=>{
  const signed=!!user && user.isAnonymous!==true;
  setNav(signed);
  if(!signed)return;

  try{
    const snap=await db.collection('users').doc(user.uid).get();
    if(!snap.exists)return;

    const role=String(snap.data().role||'user').trim().toLowerCase();
    
    if(admin && (role==='admin'||role==='supervisor')){
      admin.hidden=false;
    } else if(admin){
      admin.hidden=true;
    }
  }catch(e){
    console.error('NAV ROLE CHECK ERROR:',e);
    if(admin)admin.hidden=true;
  }
};

  if(window.auth){
  auth.onAuthStateChanged(applyNav);
} else {
  const waitForAuth = setInterval(() => {
    if (window.auth) {
      clearInterval(waitForAuth);
      auth.onAuthStateChanged(applyNav);
    }
  }, 100);
  setTimeout(() => clearInterval(waitForAuth), 5000);
}
});
