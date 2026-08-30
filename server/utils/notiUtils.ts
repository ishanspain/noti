async function sendWithRetry(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    // Only update this on confirmed success
    await Subscription.updateOne(
      { endpoint: subscription.endpoint },
      { lastSuccessfulPush: new Date() }
    )
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      await Subscription.deleteOne({ endpoint: subscription.endpoint })
    }
    throw err
  }
}

// ============================================
