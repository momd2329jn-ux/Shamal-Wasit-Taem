const form=document.getElementById('registerForm');
const msg=document.getElementById('registerMessage');
const fullNameEl=document.getElementById('fullName'),phoneEl=document.getElementById('phone'),
specializationEl=document.getElementById('specialization'),professionEl=document.getElementById('profession'),
birthDateEl=document.getElementById('birthDate'),educationEl=document.getElementById('education'),
emailEl=document.getElementById('email'),passwordEl=document.getElementById('password');

form.addEventListener('submit',async e=>{
 e.preventDefault();
 msg.textContent='جاري إنشاء الحساب...';msg.className='form-message';
 const data={fullName:fullNameEl.value.trim(),phone:phoneEl.value.trim(),specialization:specializationEl.value.trim(),profession:professionEl.value.trim(),birthDate:birthDateEl.value,education:educationEl.value,email:emailEl.value.trim().toLowerCase()};
 if(!Object.values(data).every(Boolean)||!passwordEl.value){msg.textContent='يرجى ملء جميع الحقول.';msg.className='form-message error';return;}
 if(passwordEl.value.length<6){msg.textContent='كلمة المرور يجب أن تكون 6 أحرف أو أكثر.';msg.className='form-message error';return;}
 try{
   let cred;
   const current=auth.currentUser;
   if(current&&current.isAnonymous){
     const credential=firebase.auth.EmailAuthProvider.credential(data.email,passwordEl.value);
     cred=await current.linkWithCredential(credential);
   }else{
     cred=await auth.createUserWithEmailAndPassword(data.email,passwordEl.value);
   }
   await db.collection('users').doc(cred.user.uid).set({...data,role:'user',permissions:[],createdAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
   msg.textContent='تم إنشاء الحساب بنجاح. جاري فتح حسابك...';msg.className='form-message success';
   setTimeout(()=>location.href='member.html',400);
 }catch(err){
   console.error('REGISTER ERROR:',err);
   const code=err?.code||'';
   const messages={
    'auth/email-already-in-use':'هذا البريد الإلكتروني مستخدم مسبقًا. استخدم تسجيل الدخول.',
    'auth/credential-already-in-use':'هذا البريد الإلكتروني مرتبط بحساب موجود مسبقًا. استخدم تسجيل الدخول.',
    'auth/provider-already-linked':'هذا الحساب مرتبط مسبقًا بهذا البريد الإلكتروني.',
    'auth/invalid-email':'البريد الإلكتروني غير صحيح.',
    'auth/weak-password':'كلمة المرور يجب أن تكون 6 أحرف أو أكثر.',
    'auth/operation-not-allowed':'تسجيل الدخول بالبريد الإلكتروني غير مفعّل في Firebase.',
    'auth/network-request-failed':'تعذر الاتصال بالإنترنت. تحقق من الاتصال وحاول مرة أخرى.',
    'permission-denied':'تم إنشاء الحساب لكن تعذر حفظ بيانات العضوية. تأكد من نشر قواعد Firestore الجديدة.',
    'failed-precondition':'تعذر حفظ بيانات العضوية حاليًا.',
    'unavailable':'قاعدة البيانات غير متاحة مؤقتًا.'
   };
   msg.textContent=messages[code]||('تعذر إنشاء الحساب حاليًا. رمز الخطأ: '+(code||'غير معروف'));msg.className='form-message error';
 }
});
