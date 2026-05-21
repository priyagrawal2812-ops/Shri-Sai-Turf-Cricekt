// --- Application State Manager ---
const AppState = {
  selectedDate: null, // YYYY-MM-DD
  selectedSport: 'Cricket', // 'Cricket' | 'Football'
  selectedSlot: null, // { time: string, price: number }
  bookings: [],
  blockedSlots: [],
  passcode: '1234'
};

// Available 2-hour slots layout aligned to boundaries
const TIME_SLOTS = [
  { id: 's1', time: '07:00 AM - 09:00 AM', isNight: false, price: 1300 },
  { id: 's2', time: '09:00 AM - 11:00 AM', isNight: false, price: 1300 },
  { id: 's3', time: '11:00 AM - 01:00 PM', isNight: false, price: 1300 },
  { id: 's4', time: '01:00 PM - 03:00 PM', isNight: false, price: 1300 },
  { id: 's5', time: '03:00 PM - 05:00 PM', isNight: false, price: 1300 },
  { id: 's6', time: '05:00 PM - 07:00 PM', isNight: false, price: 1300 },
  { id: 's7', time: '07:00 PM - 09:00 PM', isNight: true, price: 1500 },
  { id: 's8', time: '09:00 PM - 11:00 PM', isNight: true, price: 1500 },
  { id: 's9', time: '11:00 PM - 01:00 AM', isNight: true, price: 1500 }
];

// --- Mock Initial Database ---
const MOCK_BOOKINGS = [
  {
    id: 'b_mock_1',
    date: getOffsetDateString(0), // Today
    timeSlot: '07:00 PM - 09:00 PM',
    sport: 'Cricket',
    name: 'Suresh Raina',
    phone: '9876543210',
    price: 1500,
    status: 'Confirmed'
  },
  {
    id: 'b_mock_2',
    date: getOffsetDateString(0), // Today
    timeSlot: '09:00 PM - 11:00 PM',
    sport: 'Football',
    name: 'Pratik More',
    phone: '9812345678',
    price: 1500,
    status: 'Confirmed'
  },
  {
    id: 'b_mock_3',
    date: getOffsetDateString(1), // Tomorrow
    timeSlot: '05:00 PM - 07:00 PM',
    sport: 'Cricket',
    name: 'Karan Singh',
    phone: '8877665544',
    price: 1300,
    status: 'Confirmed'
  }
];

const MOCK_BLOCKED = [
  {
    id: 'block_mock_1',
    date: getOffsetDateString(2), // Day after tomorrow
    timeSlot: '11:00 AM - 01:00 PM',
    sport: 'Both' // Blocked for maintenance
  }
];

// Helper to get ISO date strings relative to today
function getOffsetDateString(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

// Format date into attractive display (e.g. "Fri, May 22")
function formatDateDisplay(dateStr) {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', options);
}

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  initDatabase();
  setupNavigation();
  generateDateChips();
  setupSportSelectors();
  setupModalEvents();
  setupAdminDashboard();
  setupGallery();
});

// Load/Save from LocalStorage
function initDatabase() {
  const storedBookings = localStorage.getItem('sai_bookings');
  const storedBlocked = localStorage.getItem('sai_blocked_slots');
  
  if (storedBookings) {
    AppState.bookings = JSON.parse(storedBookings);
  } else {
    AppState.bookings = [...MOCK_BOOKINGS];
    localStorage.setItem('sai_bookings', JSON.stringify(AppState.bookings));
  }

  if (storedBlocked) {
    AppState.blockedSlots = JSON.parse(storedBlocked);
  } else {
    AppState.blockedSlots = [...MOCK_BLOCKED];
    localStorage.setItem('sai_blocked_slots', JSON.stringify(AppState.blockedSlots));
  }
}

function saveBookingsToStorage() {
  localStorage.setItem('sai_bookings', JSON.stringify(AppState.bookings));
}

function saveBlockedToStorage() {
  localStorage.setItem('sai_blocked_slots', JSON.stringify(AppState.blockedSlots));
}

// --- Setup Navigation Interactions ---
function setupNavigation() {
  const header = document.querySelector('.header');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header background transition
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.backgroundColor = 'rgba(5, 6, 8, 0.95)';
      header.style.height = '70px';
    } else {
      header.style.backgroundColor = 'rgba(8, 9, 11, 0.85)';
      header.style.height = '80px';
    }
    
    // Active navigation scroll-spy
    let current = '';
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').substring(1) === current) {
        link.classList.add('active');
      }
    });
  });

  // Mobile menu click toggle
  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileToggle.classList.toggle('open');
    // Rotate hamburger lines
    const bars = mobileToggle.querySelectorAll('.bar');
    if (mobileToggle.classList.contains('open')) {
      bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
      bars[1].style.opacity = '0';
      bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
    } else {
      bars[0].style.transform = 'none';
      bars[1].style.opacity = '1';
      bars[2].style.transform = 'none';
    }
  });

  // Close mobile menu on links click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      mobileToggle.classList.remove('open');
      mobileToggle.querySelectorAll('.bar').forEach(bar => bar.style.transform = 'none');
      mobileToggle.querySelectorAll('.bar')[1].style.opacity = '1';
    });
  });
}

// --- Generate Interactive Calendar ---
function generateDateChips() {
  const container = document.getElementById('datePicker');
  container.innerHTML = '';
  
  // Render next 7 days starting from today
  for (let i = 0; i < 7; i++) {
    const fullDate = getOffsetDateString(i);
    const dateObj = new Date(fullDate);
    
    const dayLabel = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dateLabel = dateObj.getDate();
    
    const chip = document.createElement('div');
    chip.className = 'date-chip';
    if (i === 0) {
      chip.classList.add('active');
      AppState.selectedDate = fullDate;
      document.getElementById('selectedDateLabel').innerText = formatDateDisplay(fullDate);
    }
    
    chip.dataset.date = fullDate;
    chip.innerHTML = `
      <span class="day-lbl">${dayLabel}</span>
      <span class="date-lbl">${dateLabel}</span>
    `;
    
    chip.addEventListener('click', () => {
      document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      AppState.selectedDate = fullDate;
      AppState.selectedSlot = null; // Reset selection
      document.getElementById('selectedDateLabel').innerText = formatDateDisplay(fullDate);
      document.getElementById('summaryBox').classList.add('hidden');
      renderSlots();
    });
    
    container.appendChild(chip);
  }
  
  // Render slots for default date
  renderSlots();
}

// --- Setup Sport selector buttons ---
function setupSportSelectors() {
  const buttons = document.querySelectorAll('.sport-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.selectedSport = btn.dataset.sport;
      AppState.selectedSlot = null; // Reset slot
      document.getElementById('summaryBox').classList.add('hidden');
      renderSlots();
    });
  });
}

// --- Render slots inside selected date grid ---
function renderSlots() {
  const grid = document.getElementById('slotsGrid');
  grid.innerHTML = '';

  const todayStr = getOffsetDateString(0);
  const now = new Date();
  const currentHour = now.getHours();

  TIME_SLOTS.forEach(slot => {
    // 1. Check if slot has already passed today
    let isPassed = false;
    if (AppState.selectedDate === todayStr) {
      // Parse starting hour from slot string. e.g. "07:00 AM - 09:00 AM" -> 7, "07:00 PM - 09:00 PM" -> 19
      const timePart = slot.time.split(' - ')[0];
      let [hourStr, minPart] = timePart.split(':');
      let hour = parseInt(hourStr);
      const isPM = minPart.includes('PM');
      
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      
      if (currentHour >= hour) {
        isPassed = true;
      }
    }

    // 2. Check if already booked
    const isBooked = AppState.bookings.some(b => 
      b.date === AppState.selectedDate && 
      b.timeSlot === slot.time && 
      b.sport === AppState.selectedSport &&
      b.status === 'Confirmed'
    );

    // 3. Check if blocked by admin
    const isBlocked = AppState.blockedSlots.some(b => 
      b.date === AppState.selectedDate && 
      b.timeSlot === slot.time && 
      (b.sport === 'Both' || b.sport === AppState.selectedSport)
    );

    const slotDiv = document.createElement('div');
    slotDiv.className = 'slot-item';
    
    let statusMarkup = '';
    if (isPassed) {
      slotDiv.classList.add('blocked');
      statusMarkup = `<span class="slot-status-label">Passed</span>`;
    } else if (isBlocked) {
      slotDiv.classList.add('blocked');
      statusMarkup = `<span class="slot-status-label">Blocked</span>`;
    } else if (isBooked) {
      slotDiv.classList.add('booked');
      statusMarkup = `<span class="slot-status-label">Booked</span>`;
    } else {
      statusMarkup = `<span class="slot-status-label status-available">Available</span>`;
      // Click interaction only if open
      slotDiv.addEventListener('click', () => {
        document.querySelectorAll('.slot-item').forEach(s => s.classList.remove('selected'));
        slotDiv.classList.add('selected');
        
        AppState.selectedSlot = {
          time: slot.time,
          price: slot.price
        };
        
        showSummary();
      });
    }

    slotDiv.innerHTML = `
      <span class="slot-time">${slot.time.replace('AM', '').replace('PM', '').trim()} ${slot.time.includes('PM') ? 'PM' : 'AM'}</span>
      <span class="slot-price">₹${slot.price}</span>
      ${statusMarkup}
    `;

    grid.appendChild(slotDiv);
  });
}

// --- Toggle Booking Summary Panel ---
function showSummary() {
  const box = document.getElementById('summaryBox');
  if (!AppState.selectedSlot) {
    box.classList.add('hidden');
    return;
  }

  const dateFmt = formatDateDisplay(AppState.selectedDate);
  document.getElementById('summarySlot').innerText = `${dateFmt} | ${AppState.selectedSlot.time}`;
  document.getElementById('summaryPrice').innerText = `₹${AppState.selectedSlot.price}`;
  box.classList.remove('hidden');
}

// --- Booking Modals and Checkout Funnel ---
function setupModalEvents() {
  const checkoutBtn = document.getElementById('checkoutBtn');
  const bookingModal = document.getElementById('bookingModal');
  const modalClose = document.getElementById('modalClose');
  const modalCancel = document.getElementById('modalCancel');
  const bookingForm = document.getElementById('bookingForm');

  // Open confirmation details form
  checkoutBtn.addEventListener('click', () => {
    if (!AppState.selectedSlot) return;

    document.getElementById('modalSport').innerText = AppState.selectedSport;
    document.getElementById('modalDate').innerText = formatDateDisplay(AppState.selectedDate);
    document.getElementById('modalTime').innerText = AppState.selectedSlot.time;
    document.getElementById('modalPrice').innerText = `₹${AppState.selectedSlot.price}`;
    
    // Clear inputs
    document.getElementById('userName').value = '';
    document.getElementById('userPhone').value = '';

    bookingModal.classList.remove('hidden');
  });

  // Close modals
  const closeModal = () => bookingModal.classList.add('hidden');
  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);

  // Form submit -> Save and Redirection to WhatsApp
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const pName = document.getElementById('userName').value.trim();
    const pPhone = document.getElementById('userPhone').value.trim();
    
    if (!pName || !pPhone) return;

    const newBooking = {
      id: 'b_' + Date.now(),
      date: AppState.selectedDate,
      timeSlot: AppState.selectedSlot.time,
      sport: AppState.selectedSport,
      name: pName,
      phone: pPhone,
      price: AppState.selectedSlot.price,
      status: 'Confirmed'
    };

    // Save locally
    AppState.bookings.push(newBooking);
    saveBookingsToStorage();
    
    // Redraw interface
    closeModal();
    AppState.selectedSlot = null;
    document.getElementById('summaryBox').classList.add('hidden');
    renderSlots();

    // Compile message for WhatsApp API
    const bookingMessage = `Hello Shri Sai Sports Center Malkapur! 🏏⚽

I would like to book a sports slot. Here are my booking details:

• *Sport*: ${newBooking.sport} Turf
• *Date*: ${formatDateDisplay(newBooking.date)} (${newBooking.date})
• *Time Slot*: ${newBooking.timeSlot}
• *Player Name*: ${newBooking.name}
• *Phone*: ${newBooking.phone}
• *Price*: ₹${newBooking.price}

Please confirm my reservation. Thank you!`;

    const encodedMessage = encodeURIComponent(bookingMessage);
    const waNumber = '919999988888'; // Custom requested WhatsApp contact
    const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank');
  });
}

// --- Gallery Lightbox ---
function setupGallery() {
  window.openLightbox = function(element) {
    const img = element.querySelector('.gallery-img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const captionText = document.getElementById('lightboxCaption');
    
    lightbox.style.display = 'block';
    lightboxImg.src = img.src;
    captionText.innerHTML = img.alt;
  };

  window.closeLightbox = function() {
    document.getElementById('lightbox').style.display = 'none';
  };
}

// --- Admin Panel Operations & Calculations ---
function setupAdminDashboard() {
  const trigger = document.getElementById('adminTrigger');
  const adminModal = document.getElementById('adminModal');
  const adminClose = document.getElementById('adminClose');
  const authPanel = document.getElementById('adminAuthPanel');
  const mainPanel = document.getElementById('adminMainPanel');
  
  const passcodeField = document.getElementById('adminPasscode');
  const submitBtn = document.getElementById('adminSubmitBtn');
  const errorText = document.getElementById('adminPasscodeError');

  // Trigger click -> Open PIN gate
  trigger.addEventListener('click', () => {
    passcodeField.value = '';
    errorText.classList.add('hidden');
    authPanel.classList.remove('hidden');
    mainPanel.classList.add('hidden');
    adminModal.classList.remove('hidden');
  });

  adminClose.addEventListener('click', () => {
    adminModal.classList.add('hidden');
  });

  // Verify PIN
  const verifyPasscode = () => {
    const input = passcodeField.value.trim();
    if (input === AppState.passcode) {
      authPanel.classList.add('hidden');
      mainPanel.classList.remove('hidden');
      initAdminPanelData();
    } else {
      errorText.classList.remove('hidden');
      passcodeField.focus();
    }
  };

  submitBtn.addEventListener('click', verifyPasscode);
  passcodeField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyPasscode();
  });

  // Setup Admin Tabs navigation
  const tabBookings = document.getElementById('tabBookings');
  const tabBlockSlots = document.getElementById('tabBlockSlots');
  const tabStats = document.getElementById('tabStats');

  const paneBookings = document.getElementById('paneBookings');
  const paneBlockSlots = document.getElementById('paneBlockSlots');
  const paneStats = document.getElementById('paneStats');

  const switchTab = (activeTabBtn, activePane) => {
    [tabBookings, tabBlockSlots, tabStats].forEach(b => b.classList.remove('active'));
    [paneBookings, paneBlockSlots, paneStats].forEach(p => p.classList.add('hidden'));
    
    activeTabBtn.classList.add('active');
    activePane.classList.remove('hidden');
  };

  tabBookings.addEventListener('click', () => switchTab(tabBookings, paneBookings));
  tabBlockSlots.addEventListener('click', () => {
    switchTab(tabBlockSlots, paneBlockSlots);
    populateBlockSlotDropdowns();
  });
  tabStats.addEventListener('click', () => {
    switchTab(tabStats, paneStats);
    calculateAnalytics();
  });

  // Reset database button
  document.getElementById('btnClearStorage').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all bookings and settings back to defaults?')) {
      localStorage.removeItem('sai_bookings');
      localStorage.removeItem('sai_blocked_slots');
      initDatabase();
      initAdminPanelData();
      renderSlots();
    }
  });

  // Block slot action
  document.getElementById('btnBlockSlot').addEventListener('click', () => {
    const date = document.getElementById('blockDate').value;
    const time = document.getElementById('blockSlot').value;
    const sport = document.getElementById('blockSport').value;

    const newBlock = {
      id: 'block_' + Date.now(),
      date,
      timeSlot: time,
      sport
    };

    AppState.blockedSlots.push(newBlock);
    saveBlockedToStorage();
    populateBlockedTable();
    renderSlots();
  });
}

// Populate tables and view list inside Admin panel
function initAdminPanelData() {
  populateBookingsTable();
  populateBlockedTable();
}

function populateBookingsTable() {
  const tbody = document.getElementById('adminBookingsList');
  const noData = document.getElementById('noBookingsMsg');
  tbody.innerHTML = '';

  // Sort bookings: newest/nearest dates first
  const sorted = [...AppState.bookings].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) {
    noData.classList.remove('hidden');
    return;
  }
  noData.classList.add('hidden');

  sorted.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${formatDateDisplay(b.date)}</strong><br><small>${b.date}</small></td>
      <td>${b.timeSlot}</td>
      <td><span class="badge-sport ${b.sport.toLowerCase()}">${b.sport}</span></td>
      <td>${b.name}</td>
      <td><a href="https://wa.me/91${b.phone}" target="_blank" style="color:var(--neon-green)">${b.phone}</a></td>
      <td>₹${b.price}</td>
      <td><span class="badge-status confirmed">${b.status}</span></td>
      <td><button class="btn-cancel" data-id="${b.id}">Cancel</button></td>
    `;

    // Hook cancel event
    tr.querySelector('.btn-cancel').addEventListener('click', () => {
      if (confirm(`Cancel booking for ${b.name} on ${formatDateDisplay(b.date)} at ${b.timeSlot}?`)) {
        AppState.bookings = AppState.bookings.filter(x => x.id !== b.id);
        saveBookingsToStorage();
        populateBookingsTable();
        renderSlots();
      }
    });

    tbody.appendChild(tr);
  });
}

function populateBlockedTable() {
  const tbody = document.getElementById('adminBlockedList');
  const noData = document.getElementById('noBlockedMsg');
  tbody.innerHTML = '';

  if (AppState.blockedSlots.length === 0) {
    noData.classList.remove('hidden');
    return;
  }
  noData.classList.add('hidden');

  AppState.blockedSlots.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${formatDateDisplay(b.date)}</strong><br><small>${b.date}</small></td>
      <td>${b.timeSlot}</td>
      <td><span class="badge-status blocked">${b.sport === 'Both' ? 'Both Courts' : b.sport + ' Turf'}</span></td>
      <td><button class="btn-cancel" data-id="${b.id}">Unblock</button></td>
    `;

    tr.querySelector('.btn-cancel').addEventListener('click', () => {
      AppState.blockedSlots = AppState.blockedSlots.filter(x => x.id !== b.id);
      saveBlockedToStorage();
      populateBlockedTable();
      renderSlots();
    });

    tbody.appendChild(tr);
  });
}

// Populate drop downs for block slot form (limit to next 7 days and available times)
function populateBlockSlotDropdowns() {
  const dateSelect = document.getElementById('blockDate');
  const slotSelect = document.getElementById('blockSlot');
  
  dateSelect.innerHTML = '';
  slotSelect.innerHTML = '';

  // Dates dropdown
  for (let i = 0; i < 7; i++) {
    const dt = getOffsetDateString(i);
    const opt = document.createElement('option');
    opt.value = dt;
    opt.innerText = `${formatDateDisplay(dt)} (${dt})`;
    dateSelect.appendChild(opt);
  }

  // Slots dropdown
  TIME_SLOTS.forEach(slot => {
    const opt = document.createElement('option');
    opt.value = slot.time;
    opt.innerText = slot.time;
    slotSelect.appendChild(opt);
  });
}

// --- Analytics Calculations ---
function calculateAnalytics() {
  let revenue = 0;
  let totalBookings = 0;
  let cricketCount = 0;
  let footballCount = 0;

  // Track times occurrences
  const slotStats = {};
  TIME_SLOTS.forEach(s => { slotStats[s.time] = 0; });

  AppState.bookings.forEach(b => {
    if (b.status === 'Confirmed') {
      revenue += b.price;
      totalBookings++;
      if (b.sport === 'Cricket') cricketCount++;
      if (b.sport === 'Football') footballCount++;
      
      if (slotStats[b.timeSlot] !== undefined) {
        slotStats[b.timeSlot]++;
      }
    }
  });

  document.getElementById('statRevenue').innerText = `₹${revenue}`;
  document.getElementById('statTotalBookings').innerText = totalBookings;
  document.getElementById('statCricketCount').innerText = cricketCount;
  document.getElementById('statFootballCount').innerText = footballCount;

  // Draw Popular Slots Bars
  const popularContainer = document.getElementById('popularSlotsContainer');
  popularContainer.innerHTML = '';

  const maxBookings = Math.max(...Object.values(slotStats), 1);

  TIME_SLOTS.forEach(s => {
    const count = slotStats[s.time] || 0;
    const percentage = (count / maxBookings) * 100;

    const row = document.createElement('div');
    row.className = 'popular-bar-item';
    row.innerHTML = `
      <span class="popular-time">${s.time.replace('AM', '').replace('PM', '').trim()} ${s.time.includes('PM') ? 'PM' : 'AM'}</span>
      <div class="popular-bar-wrapper">
        <div class="popular-bar" style="width: ${percentage}%"></div>
      </div>
      <span class="popular-count">${count}</span>
    `;
    
    popularContainer.appendChild(row);
  });
}
