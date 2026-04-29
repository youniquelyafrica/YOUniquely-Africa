import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Coffee, Compass, MessageCircle, ChevronRight, Plane, Send, Star, Mail, ChevronLeft, Clock, Phone, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './components/Logo';
import { FaLinkedin, FaInstagram } from 'react-icons/fa';
import { fetchBookings, createBooking } from './firebase';

import imgWildlife from './assets/wildlife.jpg';
import imgCuisine from './assets/cuisine.jpg';
import imgCoastlines from './assets/coastlines.jpg';
import imgLandscapes from './assets/landscapes.jpg';
import imgWine from './assets/wine.jpg';
import imgTowns from './assets/towns.jpg';
import imgHistory from './assets/history.jpg';
import imgArt from './assets/art.webp';
import imgAgent from './assets/agent.png';

const discoverCards = [
  { id: 1, title: 'Wildlife', imgSrc: imgWildlife, text: 'Experience the thrill of spotting the Big Five (and so much more) in their natural, untamed habitat.', alt: 'South African Lion', colSpan: 'col-span-2 md:col-span-1', showArrow: true },
  { id: 2, title: 'Cuisine', imgSrc: imgCuisine, text: 'From traditional braais to Cape Malay spices, discover a world of vibrant flavours.', alt: 'South African Cuisine Braai', colSpan: 'col-span-1 md:col-span-1', showArrow: false },
  { id: 3, title: 'Coastlines', imgSrc: imgCoastlines, text: 'Explore pristine beaches and dramatic cliffs where two oceans meet.', alt: 'South African Coastline', colSpan: 'col-span-1 md:col-span-1', showArrow: false },
  { id: 4, title: 'Golden sunsets', imgSrc: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=2072&auto=format&fit=crop', text: "Watch the African sky catch fire with breathtaking sunsets you'll never forget.", alt: 'African Golden Sunset', colSpan: 'col-span-2 md:col-span-1', showArrow: true },
  { id: 5, title: 'Diverse landscapes', imgSrc: imgLandscapes, text: 'From red desert dunes to lush green forests and towering mountain peaks.', alt: 'Drakensberg Mountains South Africa', colSpan: 'col-span-1 md:col-span-1', showArrow: false },
  { id: 6, title: 'World class wine', imgSrc: imgWine, text: 'Sip award-winning vintages in the historic, oak-lined vineyards of the Cape.', alt: 'South African Winelands Vineyard and Wine Glass', colSpan: 'col-span-1 md:col-span-1', showArrow: false },
  { id: 7, title: 'Sleepy towns', imgSrc: imgTowns, text: 'Discover the charm of quiet coastal villages and historic Karoo dorps.', alt: 'South African Karoo Town', colSpan: 'col-span-2 md:col-span-1', showArrow: true },
  { id: 8, title: 'History & Culture', imgSrc: imgHistory, text: 'A rich tapestry of stories and traditions that shape the vibrant soul of the continent.', alt: 'Bo-Kaap Cape Town History', colSpan: 'col-span-1 md:col-span-1', showArrow: false },
  { id: 9, title: 'Art', imgSrc: imgArt, text: 'Discover contemporary masterpieces and ancient rock art in local galleries and beyond.', alt: 'South African Art Gallery', colSpan: 'col-span-1 md:col-span-1', showArrow: false }
];

export default function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dates: '',
    travellers: '',
    style: '',
    message: '',
    selectedDate: '',
    selectedTime: ''
  });
  const [submittedBooking, setSubmittedBooking] = useState<{date: string, time: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [activeDiscoverCard, setActiveDiscoverCard] = useState<number | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState<{ date: string; time: string }[]>([]);

  useEffect(() => {
    const loadBookedSlots = async () => {
      try {
        const data = await fetchBookings();
        setBookedSlots(data);
      } catch (error) {
        console.error("Failed to fetch booked slots:", error);
      }
    };
    loadBookedSlots();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.selectedDate || !formData.selectedTime) {
      alert("Please select a date and time for your session.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createBooking(formData);
      
      // Attempt to send email via Web3Forms if the user added the key
      if (import.meta.env.VITE_WEB3FORMS_KEY) {
        try {
          await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              access_key: import.meta.env.VITE_WEB3FORMS_KEY,
              subject: `New Session Booking from ${formData.name}`,
              from_name: 'Youniquely Africa Website',
              to_email: 'book@youniquelyafrica.com',
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              dates: formData.dates,
              travellers: formData.travellers,
              style: formData.style,
              message: formData.message,
              selectedDate: formData.selectedDate,
              selectedTime: formData.selectedTime,
            })
          });
        } catch (emailErr) {
          console.error("Failed to send email notification", emailErr);
        }
      } else {
        console.warn("VITE_WEB3FORMS_KEY is not set. Email notification was not sent. Please register at web3forms.com and add the key to your .env / Netlify environment variables.");
      }

      setSubmittedBooking({ date: formData.selectedDate, time: formData.selectedTime });
      setFormData({
        name: '', email: '', phone: '', dates: '', travellers: '', style: '',
        message: '', selectedDate: '', selectedTime: ''
      });
      const data = await fetchBookings();
      setBookedSlots(data);
    } catch (error: any) {
      alert(error.message || "Failed to book session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSlotBooked = (date: string, time: string) => {
    return bookedSlots.some(slot => slot.date === date && slot.time === time);
  };

  // Calendar Helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

  const nextMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentCalendarDate.getMonth() && 
           today.getFullYear() === currentCalendarDate.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!formData.selectedDate) return false;
    const [year, month, d] = formData.selectedDate.split('-').map(Number);
    return d === day && 
           (month - 1) === currentCalendarDate.getMonth() && 
           year === currentCalendarDate.getFullYear();
  };

  const isDateInPast = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day);
    return checkDate < today;
  };

  const isTimeInPast = (time: string) => {
    if (!formData.selectedDate) return false;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (formData.selectedDate !== todayStr) return false;

    const [hour, minute] = time.split(':').map(Number);
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    if (hour < currentHour) return true;
    if (hour === currentHour && minute <= currentMinute) return true;
    return false;
  };

  const dayStatus = (day: number) => {
    if (isDateInPast(day)) return 'past';
    if (isSelected(day)) return 'selected';
    if (isToday(day)) return 'today';
    return 'available';
  };

  const handleDateSelect = (day: number) => {
    if (isDateInPast(day)) return;
    const year = currentCalendarDate.getFullYear();
    const month = String(currentCalendarDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${d}`;
    setFormData({ ...formData, selectedDate: dateStr, selectedTime: '' });
  };

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 selection:bg-brand-earth selection:text-white scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-brand-olive/90 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="flex items-center gap-3">
          <Logo className="w-10 h-10" />
          <div className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
            YOU<span className="text-brand-earth">niquely Africa</span>
          </div>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-200">
          <a href="#hero" className="hover:text-white transition-colors">Home</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#agent" className="hover:text-white transition-colors">Agent</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#destinations" className="hover:text-white transition-colors">Discover</a>
          <a href="#contact" className="hover:text-white transition-colors">Book</a>
        </div>

        {/* Mobile Nav Toggle */}
        <button 
          className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Options"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[72px] left-0 w-full bg-brand-olive/95 backdrop-blur-md shadow-xl z-40 md:hidden border-b border-white/10"
          >
            <div className="flex flex-col py-6 px-8 gap-6">
              <a href="#hero" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-white hover:text-brand-earth transition-colors">Home</a>
              <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-white hover:text-brand-earth transition-colors">About</a>
              <a href="#agent" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-white hover:text-brand-earth transition-colors">Agent</a>
              <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-white hover:text-brand-earth transition-colors">How it works</a>
              <a href="#destinations" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-white hover:text-brand-earth transition-colors">Discover</a>
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-brand-earth hover:text-white transition-colors">Book Your Session</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.section 
        id="hero"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1.2 }}
        className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden pt-16"
      >
        <div className="absolute inset-0 z-0 overflow-hidden bg-stone-900">
          {/* YouTube Background Video */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
            <iframe 
              src="https://www.youtube.com/embed/VzqWO5EaSps?autoplay=1&mute=1&loop=1&playlist=VzqWO5EaSps&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&start=12" 
              className="absolute top-1/2 left-1/2 w-[100vw] h-[100vh] min-w-[177.77vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-[45%] scale-[1.2] opacity-70"
              allow="autoplay; encrypted-media"
              frameBorder="0"
              title="South Africa Drone Footage"
            ></iframe>
          </div>
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center mt-10">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-xl">
            Discover Africa<br />Your Way
          </h1>
          <p className="text-xl md:text-2xl text-stone-100 mb-10 max-w-3xl mx-auto font-light drop-shadow-lg">
            Making your dream holiday a reality with a South African local.
          </p>
          
          <a 
            href="#contact" 
            className="px-10 py-5 bg-brand-olive text-white rounded-full font-medium text-xl hover:bg-brand-olive-light transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center"
          >
            Start planning <ChevronRight className="ml-2 w-6 h-6" />
          </a>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm md:text-base text-stone-300 font-medium tracking-wide drop-shadow-md">
            <span>100% personalised</span>
            <span className="hidden sm:inline text-brand-olive-light">•</span>
            <span>No cookie-cutter tours</span>
            <span className="hidden sm:inline text-brand-olive-light">•</span>
            <span>Direct contact with your planner</span>
          </div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section 
        id="about" 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUpVariant}
        className="py-24 bg-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-brand-earth font-bold tracking-wider uppercase text-sm">Our Story & Why</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-deep-red mt-4 mb-8 leading-tight">
                Authenticity is Our Compass.
              </h2>
              <div className="space-y-6 text-stone-600 text-lg leading-relaxed font-light">
                <p>
                  <strong className="font-medium text-stone-900">YOUniquely Africa</strong> was born from a simple belief: the most beautiful parts of Africa are not found in a brochure. They are found in the stories of its people, in the quiet moments in the bush, and in the hidden places that only a local truly knows.
                </p>
                <p>
                  Our “why” is rooted in connection. We believe that travel should be more than simply visiting a destination; it should be about truly experiencing and understanding it. In our Netherlands-based role as a bridge between your travel dreams and the raw, unfiltered beauty of Southern Africa, we serve as your local connection. After relocating in 2026, we recognised a growing desire among Dutch travellers for authentic, thoughtfully curated journeys, and felt inspired to meet that need through our local knowledge and personal expertise.
                </p>
                <p>
                  What sets us apart is our deeply personal and hands-on approach. No two journeys are the same, which is why we move away from a one-size-fits-all model. Instead, we take the time to design a fully tailored experience around your interests, pace, and travel style.
                </p>
                <p>
                  We don’t just plan trips; we curate experiences that reflect who you are. Whether it’s your first safari or a journey back to your roots, every detail is carefully considered and infused with the warmth and spirit of Africa. From iconic landscapes to hidden gems, we ensure that your journey is not only unforgettable, but truly your own.
                </p>
              </div>
              
              <div className="mt-10 grid grid-cols-2 gap-6">
                <div className="border-l-2 border-brand-earth pl-6">
                  <h4 className="font-serif font-bold text-xl text-brand-deep-red mb-2">Our Mission</h4>
                  <p className="text-sm text-stone-500">To curate deeply personal, authentic Southern African journeys that bridge your dreams with the raw, unfiltered beauty of the continent.</p>
                </div>
                <div className="border-l-2 border-brand-earth pl-6">
                  <h4 className="font-serif font-bold text-xl text-brand-deep-red mb-2">Our Vision</h4>
                  <p className="text-sm text-stone-500">To be the premier partner for travellers seeking a hand-crafted, soulful connection to Africa that is as unique as they are.</p>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 relative">
              <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl transform lg:rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="African Landscape" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-cream rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-earth rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Trust / Social Proof Bar */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUpVariant}
        className="bg-brand-olive-light py-8 border-b border-stone-200/50"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-serif font-bold text-white mb-1">40+</span>
              <span className="text-sm md:text-base text-brand-cream font-medium">years collective team knowledge</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-serif font-bold text-white mb-1">NL</span>
              <span className="text-sm md:text-base text-brand-cream font-medium">based</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/20 text-center">
            <p className="text-white italic font-serif text-lg md:text-xl">
              "A personal touch - not a call centre."
            </p>
          </div>
        </div>
      </motion.section>

      {/* Bio / Trust Section */}
      <motion.section 
        id="agent"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUpVariant}
        className="py-24 px-6 md:px-12 max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:grid md:grid-cols-2 gap-16 items-center">
          {/* DESKTOP ONLY: IMAGE */}
          <div className="hidden md:block relative max-w-sm mx-auto md:mr-12">
            <img 
              src={imgAgent} 
              alt="Founder Portrait" 
              className="w-full h-auto object-contain drop-shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-8 -right-8 bg-brand-deep-red text-white p-8 rounded-2xl max-w-xs shadow-xl">
              <p className="font-serif text-xl italic leading-snug">
                "Traveling shouldn't be<br />
                a moment in time,<br />
                but an everlasting memory."
              </p>
            </div>
          </div>
          
          <div className="w-full">
            <span className="text-brand-earth font-bold tracking-wider uppercase text-sm">Your Local Connection</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-deep-red mt-4 mb-6 leading-tight">
              Let's Journey Together.
            </h2>
            <div className="space-y-6 text-stone-600 text-lg leading-relaxed font-light">
              <p>
                Hi, I'm Rochelle. A South African born with a deep love for travel and discovery. Exploring new places has always been more than just a passion for me, it’s about connecting with people, cultures, and the stories that make each destination unique.
              </p>
              <p>
                I am particularly drawn to experiences that go beyond the typical tourist path, those special, local moments that make you feel at home, even when you are far away. It is this perspective that I bring into every trip I help design.
              </p>
              <p>
                Now based in Dordrecht, Netherlands, I would love to connect with you, whether over a cup of coffee or via a video call, to hear about your travel dreams and help turn them into a thoughtfully curated, unforgettable journey.
              </p>
            </div>
            
            {/* MOBILE ONLY: IMAGE AND ICONS (Side by side) */}
            <div className="mt-8 flex md:hidden items-center gap-6 w-full">
              <img 
                src={imgAgent} 
                alt="Founder Portrait Mobile" 
                className="w-1/2 h-auto object-contain drop-shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col gap-6 w-1/2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-brand-deep-red font-medium">
                  <div className="w-10 h-10 rounded-full bg-olive-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-brand-olive" />
                  </div>
                  <span className="text-sm leading-tight text-left">Dordrecht Based</span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-brand-deep-red font-medium">
                  <div className="w-10 h-10 rounded-full bg-olive-100 flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5 text-brand-olive" />
                  </div>
                  <span className="text-sm leading-tight text-left">SA Native</span>
                </div>
              </div>
            </div>

            {/* DESKTOP ONLY: ICONS */}
            <div className="hidden md:flex mt-10 items-center gap-8">
              <div className="flex items-center gap-3 text-brand-deep-red font-medium">
                <div className="w-10 h-10 rounded-full bg-olive-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-brand-olive" />
                </div>
                Dordrecht Based
              </div>
              <div className="flex items-center gap-3 text-brand-deep-red font-medium">
                <div className="w-10 h-10 rounded-full bg-olive-100 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-brand-olive" />
                </div>
                SA Native
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section 
        id="how-it-works" 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUpVariant}
        className="py-24 relative overflow-hidden group/section"
      >
        {/* Background Image with Fixed Attachment */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://lh3.googleusercontent.com/d/19Q4S8-XeZlhPc9PfeK5APVuYLGqJvfs6")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        
        {/* Sophisticated Overlay */}
        <div className="absolute inset-0 bg-stone-900/40 z-10" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white drop-shadow-lg">How your trip comes together</h2>
          </div>
          
          <div className="relative">
            {/* Timeline Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-[68px] left-[12%] right-[12%] h-px border-t-2 border-dashed border-white/30 z-0"></div>
            
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative items-start">
              {/* Step 1 */}
              <motion.div 
                onClick={() => window.innerWidth < 768 && setActiveStep(activeStep === 1 ? null : 1)}
                className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 relative z-10 border border-white/20 flex flex-col cursor-pointer group"
                whileHover={{ y: -5 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl font-serif font-bold text-brand-olive opacity-60">1</div>
                  <div className={`bg-brand-olive/10 p-2 rounded-full transition-transform duration-500 ${activeStep === 1 ? 'rotate-90' : 'md:group-hover:rotate-90'}`}>
                    <ChevronRight className="w-4 h-4 text-brand-olive" />
                  </div>
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2 uppercase tracking-wide">Your Dream, Your Way</h3>
                <div className={`overflow-hidden transition-all duration-700 ease-in-out ${activeStep === 1 ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 md:group-hover:max-h-[800px] md:group-hover:opacity-100'}`}>
                  <div className="pt-4 border-t border-stone-200 mt-2">
                    <p className="text-stone-600 leading-relaxed font-light text-base">
                      We start with a personal consultation where we get to know you, your travel style, interests, pace, and what would make this journey truly unforgettable.
                    </p>
                    <p className="text-stone-600 leading-relaxed font-light text-base mt-4 italic">
                      This is a relaxed, no-pressure conversation where I listen, guide, and begin shaping your vision.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* Step 2 */}
              <motion.div 
                onClick={() => window.innerWidth < 768 && setActiveStep(activeStep === 2 ? null : 2)}
                className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 relative z-10 border border-white/20 flex flex-col cursor-pointer group"
                whileHover={{ y: -5 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl font-serif font-bold text-brand-olive opacity-60">2</div>
                  <div className={`bg-brand-olive/10 p-2 rounded-full transition-transform duration-500 ${activeStep === 2 ? 'rotate-90' : 'md:group-hover:rotate-90'}`}>
                    <ChevronRight className="w-4 h-4 text-brand-olive" />
                  </div>
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2 uppercase tracking-wide">Your Tailor-Made Itinerary</h3>
                <div className={`overflow-hidden transition-all duration-700 ease-in-out ${activeStep === 2 ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 md:group-hover:max-h-[800px] md:group-hover:opacity-100'}`}>
                  <div className="pt-4 border-t border-stone-200 mt-2">
                    <p className="text-stone-600 leading-relaxed font-light text-base">
                      After our session, I carefully design a fully personalised travel itinerary based on everything you’ve shared with us.
                    </p>
                    <p className="text-stone-600 leading-relaxed font-light text-base mt-4 italic">
                      Every detail is thoughtfully considered, from destinations and stays to experiences and flow, so your trip feels seamless and deeply meaningful.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* Step 3 */}
              <motion.div 
                onClick={() => window.innerWidth < 768 && setActiveStep(activeStep === 3 ? null : 3)}
                className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 relative z-10 border border-white/20 flex flex-col cursor-pointer group"
                whileHover={{ y: -5 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl font-serif font-bold text-brand-olive opacity-60">3</div>
                  <div className={`bg-brand-olive/10 p-2 rounded-full transition-transform duration-500 ${activeStep === 3 ? 'rotate-90' : 'md:group-hover:rotate-90'}`}>
                    <ChevronRight className="w-4 h-4 text-brand-olive" />
                  </div>
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2 uppercase tracking-wide">Your Itinerary Reveal</h3>
                <div className={`overflow-hidden transition-all duration-700 ease-in-out ${activeStep === 3 ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 md:group-hover:max-h-[800px] md:group-hover:opacity-100'}`}>
                  <div className="pt-4 border-t border-stone-200 mt-2">
                    <p className="text-stone-600 leading-relaxed font-light text-base">
                      We then meet again to walk you through your custom designed journey. This is where your trip comes to life.
                    </p>
                    <p className="text-stone-600 leading-relaxed font-light text-base mt-4 italic">
                      We’ll guide you through each part of your itinerary, explain the thinking behind our recommendations, and refine anything together to make sure it feels exactly right.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Step 4 */}
              <motion.div 
                onClick={() => window.innerWidth < 768 && setActiveStep(activeStep === 4 ? null : 4)}
                className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 relative z-10 border border-white/20 flex flex-col cursor-pointer group"
                whileHover={{ y: -5 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl font-serif font-bold text-brand-olive opacity-60">4</div>
                  <div className={`bg-brand-olive/10 p-2 rounded-full transition-transform duration-500 ${activeStep === 4 ? 'rotate-90' : 'md:group-hover:rotate-90'}`}>
                    <ChevronRight className="w-4 h-4 text-brand-olive" />
                  </div>
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2 uppercase tracking-wide">You travel, I support</h3>
                <div className={`overflow-hidden transition-all duration-700 ease-in-out ${activeStep === 4 ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 md:group-hover:max-h-[800px] md:group-hover:opacity-100'}`}>
                  <div className="pt-4 border-t border-stone-200 mt-2">
                    <p className="text-stone-600 leading-relaxed font-light text-base">
                      While you’re on the road, I am just a message away. You enjoy the magic of Africa while I handle the background details and support.
                    </p>
                    <p className="text-stone-600 leading-relaxed font-light text-base mt-4 font-medium text-brand-olive italic">
                      Feel the freedom of a fully supported journey.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>



          <div className="mt-16 text-center">
            <a 
              href="#contact" 
              className="inline-flex items-center justify-center px-10 py-5 bg-brand-olive text-white rounded-full font-medium text-xl hover:bg-brand-olive-light transition-all duration-300 shadow-2xl hover:-translate-y-1"
            >
              Get my itinerary <ChevronRight className="ml-2 w-6 h-6" />
            </a>
          </div>
        </div>
      </motion.section>

      {/* Why South Africa */}
      <motion.section 
        id="destinations" 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUpVariant}
        className="py-24 bg-stone-50"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-deep-blue mb-6">Discover Diversity</h2>
            <p className="text-stone-600 text-lg font-light leading-relaxed">
              Explore the boundless variety that South Africa has to offer. From breathtaking landscapes and thrilling wildlife encounters to rich cultural heritage and world-class culinary experiences, embarking on a journey here means uncovering a new world at every turn.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {discoverCards.map((card) => {
              const isActive = activeDiscoverCard === card.id;
              
              return (
                <div 
                  key={card.id} 
                  onClick={() => window.innerWidth < 768 && setActiveDiscoverCard(isActive ? null : card.id)}
                  className={`${card.colSpan} relative overflow-hidden group p-6 md:p-8 rounded-[2rem] border border-brand-olive/20 hover:border-brand-olive/40 transition-all duration-300 min-h-[220px] flex flex-col justify-end cursor-pointer`}
                >
                  <img 
                    src={card.imgSrc}
                    alt={card.alt}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute inset-0 transition-colors duration-500 z-10 ${isActive ? 'bg-black/40' : 'bg-black/0 group-hover:bg-black/40'}`} />
                  <div className={`absolute inset-x-0 bottom-0 transition-all duration-500 z-10 ${isActive ? 'h-full bg-gradient-to-t from-black/90 via-black/60 to-transparent' : 'h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:h-full group-hover:from-black/90 group-hover:via-black/60'}`} />
                  <div className="relative z-20 flex flex-col justify-end">
                    <div className={`flex items-center justify-between transition-all duration-500 ${isActive ? 'mb-2' : 'mb-0 group-hover:mb-2'}`}>
                      <h3 className="text-xl md:text-2xl font-serif font-bold text-white pr-4">{card.title}</h3>
                      <div className={card.showArrow ? 'block' : 'hidden md:block'}>
                        <div className={`bg-white/20 p-1 md:p-1.5 rounded-full transition-all duration-500 shrink-0 ${isActive ? 'rotate-90 opacity-100' : 'opacity-100 md:group-hover:rotate-90'}`}>
                          <ChevronRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className={`transition-[grid-template-rows] duration-500 ease-in-out grid ${isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] group-hover:grid-rows-[1fr]'}`}>
                      <div className="overflow-hidden">
                        <p className={`text-white/90 font-light text-sm md:text-base leading-relaxed mt-2 transition-opacity duration-500 delay-100 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {card.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>



      {/* Contact Form Section */}
      <motion.section 
        id="contact" 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUpVariant}
        className="py-24 bg-white"
      >
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-deep-red mb-6">Book your first session</h2>
            <p className="text-stone-600 text-lg font-light">Tell me a little about your dream trip, we'll choose a time to dive deeper together.</p>
          </div>
          
          <div className="bg-olive-50 rounded-[2rem] p-8 md:p-12 shadow-sm border border-stone-200">
            {submittedBooking ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-brand-olive/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-5xl">🌍</span>
                </div>
                <h3 className="text-4xl font-serif font-bold text-brand-deep-red mb-4">Dankjewel!</h3>
                <p className="text-stone-600 text-xl font-light">Your session is requested for {submittedBooking.date} at {submittedBooking.time}. I'll be in touch within 24 hours to confirm!</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">Full name</label>
                  <input 
                    type="text" 
                    id="name" 
                    required 
                    className="w-full px-4 py-3.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-olive focus:border-brand-olive outline-none transition-all bg-white" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-2">Cell phone number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input 
                      type="tel" 
                      id="phone" 
                      required 
                      placeholder="+31 6 12345678"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-olive focus:border-brand-olive outline-none transition-all bg-white" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">Email address</label>
                <input 
                  type="email" 
                  id="email" 
                  required 
                  className="w-full px-4 py-3.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-olive focus:border-brand-olive outline-none transition-all bg-white" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="dates" className="block text-sm font-medium text-stone-700 mb-2">Travel dates (approximate)</label>
                  <input 
                    type="text" 
                    id="dates" 
                    className="w-full px-4 py-3.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-olive focus:border-brand-olive outline-none transition-all bg-white" 
                    placeholder="e.g. Oct 2026, 2 weeks" 
                    value={formData.dates} 
                    onChange={(e) => setFormData({...formData, dates: e.target.value})} 
                  />
                </div>
                <div>
                  <label htmlFor="travellers" className="block text-sm font-medium text-stone-700 mb-2">Number of travellers</label>
                  <input 
                    type="text" 
                    id="travellers" 
                    className="w-full px-4 py-3.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-olive focus:border-brand-olive outline-none transition-all bg-white" 
                    placeholder="e.g. 2 adults, 2 kids" 
                    value={formData.travellers} 
                    onChange={(e) => setFormData({...formData, travellers: e.target.value})} 
                  />
                </div>
              </div>

              {/* Interactive Calendar Section */}
              <div className="border-t border-stone-200 pt-8">
                <label className="block text-sm font-medium text-stone-700 mb-4">Select a date & time for our session</label>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Calendar Widget */}
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-serif font-bold text-stone-900">
                        {monthNames[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}
                      </h4>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={prevMonth}
                          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-stone-600" />
                        </button>
                        <button 
                          type="button"
                          onClick={nextMonth}
                          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 text-stone-600" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-xs font-bold text-stone-400 uppercase tracking-wider">{day}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {/* Padding for first day */}
                      {Array.from({ length: firstDayOfMonth(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth()) }).map((_, i) => (
                        <div key={`pad-${i}`} className="h-10"></div>
                      ))}
                      
                      {/* Actual Days */}
                      {Array.from({ length: daysInMonth(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth()) }).map((_, i) => {
                        const day = i + 1;
                        const status = dayStatus(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            disabled={status === 'past'}
                            onClick={() => handleDateSelect(day)}
                            className={`h-10 w-full flex items-center justify-center rounded-lg text-sm transition-all
                              ${status === 'selected' 
                                ? 'bg-brand-olive text-white font-bold shadow-md' 
                                : status === 'past'
                                ? 'text-stone-300 cursor-not-allowed opacity-50'
                                : 'hover:bg-brand-olive/10 text-stone-700'
                              }
                              ${status === 'today' ? 'ring-2 ring-brand-olive/30 ring-inset' : ''}
                            `}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots Widget */}
                  <div className="flex flex-col">
                    <AnimatePresence mode="wait">
                      {formData.selectedDate ? (
                        <motion.div 
                          key="slots"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex flex-col h-full"
                        >
                          <div className="flex items-center gap-2 mb-4 text-brand-olive">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">Available times for {formData.selectedDate}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {timeSlots.map(time => {
                              const past = isTimeInPast(time);
                              const booked = isSlotBooked(formData.selectedDate, time);
                              const disabled = past || booked;
                              return (
                                <button
                                  key={time}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => setFormData({ ...formData, selectedTime: time })}
                                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all
                                    ${formData.selectedTime === time 
                                      ? 'bg-brand-olive border-brand-olive text-white shadow-md' 
                                      : disabled
                                      ? 'bg-stone-50 border-stone-100 text-stone-300 cursor-not-allowed'
                                      : 'border-stone-200 bg-white text-stone-600 hover:border-brand-olive hover:text-brand-olive'
                                    }
                                  `}
                                >
                                  {booked ? 'Booked' : time}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="prompt"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center h-full bg-stone-100/50 rounded-2xl border border-dashed border-stone-300 p-8 text-center"
                        >
                          <Calendar className="w-12 h-12 text-stone-300 mb-4" />
                          <p className="text-stone-500 text-sm italic font-light">Please select a date on the calendar to see available time slots.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="style" className="block text-sm font-medium text-stone-700 mb-2">Trip style</label>
                <select 
                  id="style" 
                  className="w-full px-4 py-3.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-olive focus:border-brand-olive outline-none transition-all bg-white appearance-none cursor-pointer" 
                  value={formData.style} 
                  onChange={(e) => setFormData({...formData, style: e.target.value})}
                >
                  <option value="" disabled>Select a style...</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Culture & food">Culture & food</option>
                  <option value="Safari">Safari</option>
                  <option value="Mix of everything">Mix of everything</option>
                  <option value="Surprise me">Surprise me</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-2">Message (optional)</label>
                <textarea 
                  id="message" 
                  rows={4} 
                  className="w-full px-4 py-3.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-olive focus:border-brand-olive outline-none transition-all bg-white resize-none" 
                  placeholder="Any special requests or must-sees?" 
                  value={formData.message} 
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-brand-olive text-white rounded-xl font-bold text-xl hover:bg-brand-olive-light transition-all duration-300 flex items-center justify-center group shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Book my session'} &rarr;
              </button>
              <p className="text-center text-sm text-stone-500">I value your time. No spam, ever.</p>
            </form>
            )}
          </div>

          <div className="mt-16 text-center">
            <p className="text-stone-600 mb-6 font-medium">Prefer to chat? Message me directly on WhatsApp</p>
            <a 
              href="https://wa.me/31615480472?text=Hi,%20I'm%20interested%20in%20planning%20a%20trip%20to%20South%20Africa%20with%20Uniquely%20Africa." 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center px-8 py-4 bg-[#25D366] text-white rounded-full font-medium text-lg hover:bg-[#20bd5a] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <MessageCircle className="mr-2 w-6 h-6" /> WhatsApp Me
            </a>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-16 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Logo className="w-12 h-12" />
                <div className="text-3xl font-serif font-bold text-white tracking-wide">
                  YOU<span className="text-brand-earth">niquely Africa</span>
                </div>
              </div>
              <p className="font-light text-stone-300 text-lg max-w-sm">
                South African roots. Dordrecht based.<br />
                Your trip, personalised.
              </p>
            </div>
            <div className="flex flex-col md:justify-end items-start md:items-end">
              <div className="flex flex-col gap-4 text-stone-300 font-light w-full md:w-[360px]">
                <div className="flex items-start md:items-center gap-3">
                  <MapPin className="w-5 h-5 shrink-0 mt-0.5 md:mt-0" />
                  <span className="leading-relaxed">
                    Kilwijkstraat, Dordrecht, Netherlands,<br />
                    3311 WN
                  </span>
                </div>
                <a href="tel:+31615480472" className="flex items-center gap-3 hover:text-white transition-colors">
                  <Phone className="w-5 h-5 shrink-0" /> +31 6 15480472
                </a>
                <a href="mailto:book@youniquelyafrica.com" className="flex items-center gap-3 hover:text-white transition-colors">
                  <Mail className="w-5 h-5 shrink-0" /> book@youniquelyafrica.com
                </a>
                <a 
                  href="https://www.linkedin.com/company/youniquely-africa/about/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 hover:text-white transition-colors"
                >
                  <FaLinkedin className="w-5 h-5 shrink-0" /> LinkedIn
                </a>
                <a 
                  href="https://www.instagram.com/youniquelyafrica" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 hover:text-white transition-colors"
                >
                  <FaInstagram className="w-5 h-5 shrink-0" /> Instagram
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm font-light">
            <p>© {new Date().getFullYear()} YOUniquely Africa | KVK: 42047666</p>
            <div className="flex flex-col items-start md:items-end w-full md:w-auto">
              <div className="w-full md:w-[360px]">
                <p className="text-stone-500 text-[10px] uppercase tracking-widest text-left">Drone footage by Scenic Relaxation</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/31615480472?text=Hi,%20I'm%20interested%20in%20planning%20a%20trip%20to%20South%20Africa%20with%20Uniquely%20Africa." 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 z-50 group"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-8 h-8" />
        <span className="absolute right-full mr-4 bg-white text-stone-800 px-4 py-2 rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg pointer-events-none">
          Chat with me!
        </span>
      </a>
    </div>
  );
}
