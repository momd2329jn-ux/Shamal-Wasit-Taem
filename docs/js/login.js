const form = document.getElementById('loginForm');
const msg = document.getElementById('loginMessage');

const next =
  new URLSearchParams(location.search).get('next');

form.addEventListener('submit', async (e) => {

  e.preventDefault();

  msg.textContent = 'جاري تسجيل الدخول...';
  msg.className = 'form-message';

  const email =
    document.getElementById('email').value.trim().toLowerCase();

  const password =
    document.getElementById('password').value;

  if (!email || !password) {
    msg.textContent =
      'يرجى إدخال البريد الإلكتروني وكلمة المرور.';
    msg.className = 'form-message error';
    return;
  }

  try {

    const cred =
      await auth.signInWithEmailAndPassword(
        email,
        password
      );

    const snap =
      await db
        .collection('users')
        .doc(cred.user.uid)
        .get();

    if (!snap.exists) {
      msg.textContent =
        'تم تسجيل الدخول، لكن لم يتم العثور على بيانات العضوية.';
      msg.className = 'form-message error';
      return;
    }

    const userData = snap.data();

    const role =
      String(userData.role || 'user')
        .trim()
        .toLowerCase();

    console.log('LOGIN USER:', {
      uid: cred.user.uid,
      email: cred.user.email,
      role: role,
      permissions: userData.permissions || []
    });

    if (role === 'admin' || role === 'supervisor') {

      location.href =
        next && next !== 'member.html'
          ? next
          : 'admin.html';

      return;
    }

    location.href =
      next && next !== 'admin.html'
        ? next
        : 'member.html';

  } catch (err) {

    console.error('LOGIN ERROR:', err);

    if (
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/wrong-password' ||
      err.code === 'auth/user-not-found'
    ) {

      msg.textContent =
        'البريد الإلكتروني أو كلمة المرور غير صحيحة.';

    } else if (err.code === 'auth/invalid-email') {

      msg.textContent =
        'البريد الإلكتروني غير صحيح.';

    } else {

      msg.textContent =
        'حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.';
    }

    msg.className = 'form-message error';
  }
});