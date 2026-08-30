async function setupPushForRider(riderId) {
  const registration = await navigator.serviceWorker.ready
  
  // Check existing subscription first
  let subscription = await registration.pushManager.getSubscription()
  
  if (!subscription) {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return // don't nag, just skip
    
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY
    })
  }
  
  // Always send to backend after login, even if subscription already existed —
  // handles the case where a different rider logs in on the same device
  await fetch('/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ riderId, subscription })
  })
}


// ==========================================
/* {
  riderId: String,
  fcmToken: String, 
  platform: 'web' | 'android' | 'ios'
} */

  // =====================================
  try {
  await admin.messaging().send({ token: rider.fcmToken, notification: {...} })
  await Subscription.updateOne({ fcmToken: rider.fcmToken }, { lastSuccessfulPush: new Date() })
} catch (err) {
  if (err.code === 'messaging/registration-token-not-registered' || 
      err.code === 'messaging/invalid-registration-token') {
    await Subscription.deleteOne({ fcmToken: rider.fcmToken })
  }
  throw err
}