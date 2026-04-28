import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Firebase Admin
  const firebaseConfig = {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    firestoreDatabaseId: process.env.VITE_FIREBASE_DATABASE_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
  };

  if (!admin.apps.length) {
    admin.initializeApp();
  }
  
  // Try to use the project ID from the config if auto-detection doesn't work for getFirestore
  const projectId = admin.app().options.projectId || firebaseConfig.projectId;
  const db = getFirestore(firebaseConfig.firestoreDatabaseId || '(default)');
  const bookingsCol = db.collection('bookings');

  // In-memory fallback
  let inMemoryBookings: any[] = [];

  // Helper to fetch all booked slots
  const getBookedSlots = async () => {
    try {
      console.log(`[INFO] Fetching booked slots from database: ${firebaseConfig.firestoreDatabaseId || '(default)'}`);
      const snapshot = await bookingsCol.get();
      return snapshot.docs.map(doc => ({
        date: doc.data().selectedDate,
        time: doc.data().selectedTime
      }));
    } catch (error: any) {
      console.warn("Cloud Firestore API might be disabled or permission denied. Using in-memory fallback.");
      return inMemoryBookings.map(b => ({ date: b.selectedDate, time: b.selectedTime }));
    }
  };

  // API Route to fetch booked slots
  app.get("/api/booked-slots", async (req, res) => {
    const slots = await getBookedSlots();
    res.json(slots);
  });

  // API Route to book a session
  app.post("/api/book-session", async (req, res) => {
    const { name, email, phone, dates, travellers, style, message, selectedDate, selectedTime } = req.body;

    let isAlreadyBooked = false;
    
    try {
      // Check if slot is already booked in Firestore
      const query = await bookingsCol
        .where('selectedDate', '==', selectedDate)
        .where('selectedTime', '==', selectedTime)
        .limit(1)
        .get();

      if (!query.empty) {
        isAlreadyBooked = true;
      }
    } catch (err) {
      // Fallback check in memory
      isAlreadyBooked = inMemoryBookings.some(b => b.selectedDate === selectedDate && b.selectedTime === selectedTime);
    }

    if (isAlreadyBooked) {
      return res.status(400).json({ error: "This slot is already booked." });
    }

    // Add to Firestore
    try {
      await bookingsCol.add({
        name,
        email,
        phone: phone || "",
        dates: dates || "",
        travellers: travellers || "",
        style: style || "",
        message: message || "",
        selectedDate,
        selectedTime,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.warn("Firestore booking error (likely API disabled). Saving to in-memory fallback.");
      inMemoryBookings.push({
        name,
        email,
        phone: phone || "",
        dates: dates || "",
        travellers: travellers || "",
        style: style || "",
        message: message || "",
        selectedDate,
        selectedTime,
        createdAt: new Date().toISOString()
      });
    }

    // Send Email Simulation
    // The user wants it linked to: book@uniquelyafrica.com
    console.log(`[EMAIL SENDING SIMULATION]`);
    console.log(`To: book@uniquelyafrica.com`);
    console.log(`Subject: New Session Booking from ${name}`);
    console.log(`Body:
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Dates: ${dates}
      Travellers: ${travellers}
      Style: ${style}
      Selected Date: ${selectedDate}
      Selected Time: ${selectedTime}
      Message: ${message}
    `);
    
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
