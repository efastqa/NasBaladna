import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import config from '../firebase-applet-config.json';
import http from 'http';

function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  if (typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        res[key] = sanitizeForFirestore(value);
      }
    }
    return res;
  }
  return obj;
}

async function runMultiDeviceVerification() {
  console.log('====================================================');
  console.log('🚀 MULTI-DEVICE REAL-TIME ORDER VERIFICATION TEST');
  console.log('Firestore Database ID:', config.firestoreDatabaseId);
  console.log('====================================================');

  const app = initializeApp(config);
  const db = initializeFirestore(app, {}, config.firestoreDatabaseId);

  const testOrderId = `test-ord-multidev-${Date.now()}`;
  const testOrderNumber = `NB-${Math.floor(100000 + Math.random() * 900000)}`;

  let firestoreReceived = false;
  let sseReceived = false;
  let receivedOrderData: any = null;

  // 1. Setup Device 2 (Store Owner / Admin) Firestore Real-Time Listener
  console.log('📡 [Device 2: Store Admin] Starting Google Cloud Firestore onSnapshot WebSocket listener...');
  const unsubscribeFirestore = onSnapshot(collection(db, 'orders'), (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const data = change.doc.data();
      if (change.doc.id === testOrderId || data.orderNumber === testOrderNumber) {
        firestoreReceived = true;
        receivedOrderData = data;
        console.log(`✅ [Device 2: Store Admin] REAL-TIME FIRESTORE EVENT RECEIVED: #${data.orderNumber} (${data.customerName})`);
      }
    });
  });

  // 2. Setup Device 2 (Store Owner / Admin) SSE Stream Listener
  console.log('📡 [Device 2: Store Admin] Connecting to Server-Sent Events (SSE) /api/orders/stream...');
  const sseReq = http.get('http://localhost:3000/api/orders/stream', (res) => {
    res.on('data', (chunk) => {
      const text = chunk.toString();
      if (text.includes(testOrderNumber) || text.includes(testOrderId)) {
        sseReceived = true;
        console.log('✅ [Device 2: Store Admin] REAL-TIME SSE STREAM EVENT RECEIVED from server!');
      }
    });
  });

  // Give listeners 1.5s to establish connection
  await new Promise((r) => setTimeout(r, 1500));

  // 3. Simulate Device 1 (Customer Mobile Phone / PWA / iPhone) placing an order
  console.log('\n📱 [Device 1: Customer Phone] Customer placing order at checkout...');
  const sampleCustomerOrder = {
    id: testOrderId,
    orderNumber: testOrderNumber,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'confirmed',
    customerName: 'Fatima Al-Thani',
    phone: '+974 5589 1234',
    address: 'Villa 14, Street 892, Zone 66',
    district: 'West Bay Lagoon',
    deliverySlot: 'Express Delivery (35 Mins)',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    total: 84.5,
    currency: 'QAR',
    items: [
      {
        id: 'nb-pani-dodam-1kg',
        productId: 'nb-pani-dodam',
        name: 'Pani Dodam (Sweet Orange)',
        selectedWeight: '1kg',
        pricePerUnit: 14.5,
        quantity: 2,
      },
    ],
    // Test optional fields that can be undefined
    coordinates: undefined,
    deliveryNotes: 'Please leave at main gate reception',
    bluePlateInfo: undefined,
    createdTimestamp: Date.now(),
  };

  const cleanOrder = sanitizeForFirestore(sampleCustomerOrder);

  // Write simultaneously to Firestore and to REST API as Device 1 does
  console.log('📱 [Device 1: Customer Phone] Submitting order to Firestore and Backend API...');
  
  const postApiPromise = new Promise((resolve) => {
    const postReq = http.request(
      'http://localhost:3000/api/orders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(JSON.parse(data)));
      }
    );
    postReq.write(JSON.stringify(sampleCustomerOrder));
    postReq.end();
  });

  await Promise.all([
    setDoc(doc(db, 'orders', testOrderId), cleanOrder),
    postApiPromise,
  ]);

  console.log('📱 [Device 1: Customer Phone] Order submitted successfully!');

  // Wait for real-time propagation
  console.log('\n⏳ Waiting for multi-device real-time sync verification...');
  let waitCount = 0;
  while ((!firestoreReceived || !sseReceived) && waitCount < 10) {
    await new Promise((r) => setTimeout(r, 500));
    waitCount++;
  }

  // Cleanup
  unsubscribeFirestore();
  sseReq.destroy();
  await deleteDoc(doc(db, 'orders', testOrderId));
  console.log('🧹 Cleaned up test order from Firestore.');

  console.log('\n================ VERIFICATION SUMMARY ================');
  console.log(`Firestore WebSocket Real-time Sync: ${firestoreReceived ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Server-Sent Events (SSE) Push:      ${sseReceived ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log('======================================================');

  if (firestoreReceived) {
    console.log('🎉 SUCCESS: Online orders successfully reflect in real time across devices!');
    process.exit(0);
  } else {
    console.error('❌ FAILURE: Real-time order sync was not received.');
    process.exit(1);
  }
}

runMultiDeviceVerification().catch((err) => {
  console.error('Verification script error:', err);
  process.exit(1);
});
