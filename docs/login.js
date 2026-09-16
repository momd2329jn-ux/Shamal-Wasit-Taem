const form = document.getElementById('loginForm');
const msg = document.getElementById('loginMessage');
const next = new URLSearchParams(location.search).get('next');

function loginMessage(code){
  const messages={
    'auth/invalid-credential':'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'auth/wrong-password':'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'auth/user-not-found':'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'auth/invalid-email':'البريد الإلكتروني غير صحيح.',
    'auth/user-disabled':'هذا الحساب معطّل. تواصل مع الإدارة.',
    'auth/too-many-requests':'تمت محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.',
    'auth/network-request-failed':'تعذر الاتصال بالإنترنت. تحقق من الاتصال وحاول مرة أخرى.',
    'permission-denied':'تم تسجيل الدخول، لكن تعذر قراءة بيانات حسابك من Firestore. تأكد من نشر القواعد الجديدة.',
    'failed-precondition':'تعذر الوصول إلى قاعدة البيانات حاليًا.',
    'unavailable':'قاعدة البيانات غير متاحة مؤقتًا.'
  };
  return messages[code]||('تعذر تسجيل الدخول حاليًا. رمز الخطأ: '+(code||'غير معروف'));
}

form.addEventListener('submit',async e=>{
  e.preventDefault();
  msg.textContent='جاري تسجيل الدخول...'; msg.className='form-message';
  const email=document.getElementById('email').value.trim().toLowerCase();
  const password=document.getElementById('password').value;
  if(!email||!password){msg.textContent='يرجى إدخال البريد الإلكتروني وكلمة المرور.';msg.className='form-message error';return;}
  try{
    const cred=await auth.signInWithEmailAndPassword(email,password);
    const snap=await db.collection('users').doc(cred.user.uid).get();
    if(!snap.exists){msg.textContent='تم تسجيل الدخول، لكن بيانات العضوية غير موجودة. تواصل مع الإدارة.';msg.className='form-message error';return;}
    const data=snap.data()||{};
    const role=String(data.role||'user').trim().toLowerCase();
    const perms=Array.isArray(data.permissions)?data.permissions:[];
    const authorized=role==='admin'||(role==='supervisor'&&perms.length>0);
    if(next){
      const safeNext=['index.html','member.html','inquiry.html','admin.html'].includes(next)?next:'member.html';
      if(safeNext==='admin.html'&&!authorized){location.href='member.html';return;}
      location.href=safeNext; return;
    }
    location.href=authorized?'admin.html':'member.html';
  }catch(err){
    console.error('LOGIN ERROR:',err);
    msg.textContent=loginMessage(err?.code); msg.className='form-message error';
  }
});
