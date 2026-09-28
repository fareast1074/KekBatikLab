const { onValueCreated } = require('firebase-functions/v2/database');
const { logger } = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

exports.notifyAdminNewOrder = onValueCreated(
  {
    ref: '/kekBatikLabApp/orders/{orderId}',
    instance: 'salestracker-1b3e2-default-rtdb',
    region: 'us-central1'
  },
  async (event) => {
    const order = event.data.val() || {};
    const orderId = event.params.orderId;

    // Notify only for customer-submitted orders, not orders created by Admin.
    if ((order.source || 'Customer') !== 'Customer') {
      logger.info('Skipping non-customer order notification', { orderId, source: order.source });
      return;
    }

    const db = getDatabase();
    const [devicesSnap, productSnap] = await Promise.all([
      db.ref('/kekBatikLabApp/admin_push_devices').once('value'),
      db.ref(`/kekBatikLabApp/products/${order.productId || 'kek-batik'}`).once('value')
    ]);

    const rawDevices = devicesSnap.val() || {};
    const devices = Object.entries(rawDevices)
      .map(([uid, item]) => ({ uid, ...(item || {}) }))
      .filter((item) => item.enabled !== false && typeof item.token === 'string' && item.token.length > 20)
      .slice(0, 500);

    if (!devices.length) {
      logger.info('No registered admin push devices', { orderId });
      return;
    }

    const product = productSnap.val() || {};
    const productName = product.name || order.productId || 'Product';
    const qty = Math.max(1, Number(order.qty || 1));
    const customer = String(order.customer || 'Customer').trim() || 'Customer';
    const orderNo = String(order.orderNo || orderId);
    const orderDate = String(order.date || '');

    const title = 'New Order Received';
    const body = `${customer}: ${qty} x ${productName}${orderDate ? ` for ${orderDate}` : ''}`;

    const messages = devices.map((device) => ({
      token: device.token,
      data: {
        title,
        body,
        orderId: String(orderId),
        orderNo,
        clickPath: '/?adminTab=orders'
      },
      webpush: {
        headers: {
          Urgency: 'high'
        }
      }
    }));

    const result = await getMessaging().sendEach(messages);
    logger.info('Admin order notification result', {
      orderId,
      successCount: result.successCount,
      failureCount: result.failureCount
    });

    // Remove stale/invalid browser registrations so future sends stay clean.
    const removals = [];
    result.responses.forEach((response, index) => {
      if (response.success) return;
      const code = response.error?.code || '';
      if (
        code.includes('registration-token-not-registered') ||
        code.includes('invalid-registration-token') ||
        code.includes('invalid-argument')
      ) {
        removals.push(db.ref(`/kekBatikLabApp/admin_push_devices/${devices[index].uid}`).remove());
      }
    });
    await Promise.allSettled(removals);
  }
);
