import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function test() {
  try {
    const bookingData = {
      name: 'Test Name',
      email: 'test@example.com',
      phone: '',
      dates: '',
      travellers: '',
      style: '',
      message: '',
      selectedDate: '2026-10-10',
      selectedTime: '10:00'
    };

    const slotsCol = collection(db, 'slots');
    
    const q = query(
      slotsCol, 
      where('selectedDate', '==', bookingData.selectedDate),
      where('selectedTime', '==', bookingData.selectedTime)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log("Slot already booked, clearing for test...");
      bookingData.selectedTime = '11:00';
    }

    const batch = writeBatch(db);
    const newBookingRef = doc(collection(db, 'bookings'));
    const newSlotRef = doc(collection(db, 'slots'));

    batch.set(newBookingRef, {
      ...bookingData,
      createdAt: serverTimestamp()
    });

    batch.set(newSlotRef, {
      selectedDate: bookingData.selectedDate,
      selectedTime: bookingData.selectedTime,
      createdAt: serverTimestamp()
    });

    await batch.commit();
    console.log("Success!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

test();
