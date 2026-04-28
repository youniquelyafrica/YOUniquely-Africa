import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const fetchBookings = async () => {
  try {
    const slotsCol = collection(db, 'slots');
    const snapshot = await getDocs(slotsCol);
    return snapshot.docs.map(d => ({
      date: d.data().selectedDate,
      time: d.data().selectedTime
    }));
  } catch (error) {
    console.error("Error fetching slots:", error);
    return [];
  }
};

export const createBooking = async (bookingData: any) => {
  try {
    const slotsCol = collection(db, 'slots');
    
    // Check if slot is taken
    const q = query(
      slotsCol, 
      where('selectedDate', '==', bookingData.selectedDate),
      where('selectedTime', '==', bookingData.selectedTime)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error("This slot is already booked.");
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
    return true;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};
