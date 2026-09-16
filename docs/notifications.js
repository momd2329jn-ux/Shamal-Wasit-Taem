(function(){
 let lastAdminCount=0,lastMemberReplyCount=0,lastUpdateIds=new Set();
 function browserNotice(title,body){
   try{if('Notification'in window&&Notification.permission==='granted')new Notification(title,{body,icon:'images/logo.png',dir:'rtl',lang:'ar'});}catch(e){console.warn(e);}
 }
 async function create(data){try{return await db.collection('notifications').add({...data,createdAt:firebase.firestore.FieldValue.serverTimestamp()});}catch(e){console.warn('notification create',e);return null;}}
 window.WasitNotifications={
  unreadCount:0,
  create,
  notifyNewPost:async function(category,title){return create({audience:'all',type:'new_post',category,title,body:'تم نشر '+title+' في قسم '+category+'.'});},
  notifyReply:async function(userId,title){return create({audience:'user',userId,type:'reply',title,body:'تم الرد على استفسارك من فريق شمال واسط.'});},
  listenAdminInquiries:function(user,onChange){
   if(!user||!window.db)return()=>{};
   return db.collection('inquiries').where('status','==','new').onSnapshot(snap=>{
    let count=0;snap.forEach(d=>{if(d.data().adminSeen!==true)count++;});
    if(count>lastAdminCount)browserNotice('فريق شمال واسط','لديك استفسار مواطن جديد.');
    lastAdminCount=count;this.unreadCount=count;if(onChange)onChange(count,snap);
   },e=>console.error('إشعارات الإدارة',e));
  },
  listenMemberReplies:function(user,onChange){
   if(!user||!window.db)return()=>{};
   return db.collection('inquiries').where('userId','==',user.uid).onSnapshot(snap=>{
    let count=0;snap.forEach(d=>{const x=d.data();if(x.status==='replied'&&x.userSeen!==true)count++;});
    if(count>lastMemberReplyCount)browserNotice('فريق شمال واسط','تم الرد على أحد استفساراتك.');
    lastMemberReplyCount=count;if(onChange)onChange(count,snap);
   },e=>console.error('إشعارات الردود',e));
  },
  listenMemberUpdates:function(user,onChange){
   if(!user||!window.db)return()=>{};
   const handlers=[],state={all:[],mine:[]};
   const emit=()=>{
    const rows=[...state.all,...state.mine].filter(x=>!lastUpdateIds.has(x.id));
    let unread=state.all.filter(x=>x.data().seen!==true).length+state.mine.filter(x=>x.data().seen!==true).length;
    this.unreadCount=unread;if(onChange)onChange(unread,[...state.all,...state.mine]);
    rows.slice(0,5).forEach(x=>{lastUpdateIds.add(x.id);browserNotice('فريق شمال واسط',x.data().body||'لديك تحديث جديد.');});
   };
   handlers.push(db.collection('notifications').where('audience','==','all').onSnapshot(s=>{state.all=s.docs;emit();},e=>console.warn(e)));
   handlers.push(db.collection('notifications').where('audience','==','user').where('userId','==',user.uid).onSnapshot(s=>{state.mine=s.docs;emit();},e=>console.warn(e)));
   return()=>handlers.forEach(h=>h());
  },
  requestBrowserPermission:function(){if(!('Notification'in window))return Promise.resolve('unsupported');return Notification.requestPermission();},
  markMemberSeen:function(id){return db.collection('inquiries').doc(id).update({userSeen:true});}
 };
})();