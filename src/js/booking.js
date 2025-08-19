// Booking functionality
class BookingManager {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('restaurant_current_user') || 'null');
    this.selectedDate = null;
    this.selectedTime = null;
    this.availableSlots = [];
    
    this.checkAuthStatus();
    this.initializeComponents();
    this.initializeEventListeners();
    this.loadUserInfo();
  }

  checkAuthStatus() {
    if (!this.currentUser) {
      // User not logged in, redirect to auth page
      window.location.href = '/';
      return;
    }
  }

  loadUserInfo() {
    const welcomeElement = document.getElementById('userWelcome');
    if (welcomeElement && this.currentUser) {
      welcomeElement.textContent = `Welcome, ${this.currentUser.name}`;
    }
  }

  initializeComponents() {
    this.initializeDatePicker();
    this.generateTimeSlots();
  }

  initializeDatePicker() {
    const today = moment();
    const maxDate = moment().add(30, 'days'); // Allow booking up to 30 days in advance

    $('#datePicker').daterangepicker({
      singleDatePicker: true,
      autoUpdateInput: false,
      minDate: today,
      maxDate: maxDate,
      locale: {
        format: 'DD/MM/YYYY',
        applyLabel: 'Select',
        cancelLabel: 'Cancel',
        daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'],
        firstDay: 0
      }
    }, (start) => {
      this.selectedDate = start;
      $('#datePicker').val(start.format('DD/MM/YYYY'));
      this.loadAvailableSlots(start);
      this.updateBookingSummary();
    });

    // Set default date to today
    const defaultDate = moment();
    this.selectedDate = defaultDate;
    $('#datePicker').val(defaultDate.format('DD/MM/YYYY'));
    this.loadAvailableSlots(defaultDate);
  }

  generateTimeSlots() {
    // Restaurant hours: 10:30 AM - 11:00 PM
    const slots = [];
    const startHour = 10;
    const startMinute = 30;
    const endHour = 23;

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = (hour === startHour ? startMinute : 0); minute < 60; minute += 90) {
        if (hour === endHour && minute > 0) break;
        
        const time = moment().hour(hour).minute(minute);
        slots.push({
          time: time.format('HH:mm'),
          display: time.format('h:mm A'),
          available: true
        });
      }
    }

    this.availableSlots = slots;
  }

  loadAvailableSlots(selectedDate) {
    const loadingElement = document.getElementById('loadingSlots');
    const slotsContainer = document.getElementById('slotsContainer');
    const noSlotsElement = document.getElementById('noSlots');

    // Show loading
    loadingElement.style.display = 'block';
    slotsContainer.style.display = 'none';
    noSlotsElement.style.display = 'none';

    // Simulate API call delay
    setTimeout(() => {
      const slots = this.getAvailableSlotsForDate(selectedDate);
      
      loadingElement.style.display = 'none';
      
      if (slots.length === 0) {
        noSlotsElement.style.display = 'block';
      } else {
        this.renderTimeSlots(slots);
        slotsContainer.style.display = 'block';
      }
    }, 800);
  }

  getAvailableSlotsForDate(date) {
    // Simulate different availability based on date
    const dayOfWeek = date.day();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isToday = date.isSame(moment(), 'day');
    const currentTime = moment();

    return this.availableSlots.map(slot => {
      const slotDateTime = date.clone().hour(parseInt(slot.time.split(':')[0])).minute(parseInt(slot.time.split(':')[1]));
      
      let available = true;
      let reason = '';

      // If it's today, disable past time slots
      if (isToday && slotDateTime.isBefore(currentTime.add(2, 'hours'))) {
        available = false;
        reason = 'past';
      }
      
      // Simulate some random unavailability (70% availability)
      else if (Math.random() > 0.7) {
        available = false;
        reason = 'booked';
      }
      
      // Weekend peak hours (7-9 PM) are more likely to be booked
      else if (isWeekend && slotDateTime.hour() >= 19 && slotDateTime.hour() <= 21 && Math.random() > 0.4) {
        available = false;
        reason = 'booked';
      }

      return {
        ...slot,
        available,
        reason,
        dateTime: slotDateTime
      };
    });
  }

  renderTimeSlots(slots) {
    const container = document.getElementById('slotsContainer');
    container.innerHTML = '';

    slots.forEach(slot => {
      const button = document.createElement('button');
      button.className = `slot ${slot.available ? 'available' : 'disabled'}`;
      button.textContent = slot.display;
      button.dataset.time = slot.time;
      button.dataset.display = slot.display;

      if (slot.available) {
        button.addEventListener('click', () => this.selectTimeSlot(button, slot));
      } else {
        button.disabled = true;
        button.title = slot.reason === 'past' ? 'Time has passed' : 'Already booked';
      }

      container.appendChild(button);
    });
  }

  selectTimeSlot(button, slot) {
    // Remove previous selection
    document.querySelectorAll('.slot.selected').forEach(btn => {
      btn.classList.remove('selected');
      btn.classList.add('available');
    });

    // Select current slot
    button.classList.remove('available');
    button.classList.add('selected');

    this.selectedTime = slot;
    this.updateBookingSummary();
    this.updateConfirmButton();
  }

  updateBookingSummary() {
    const summaryElement = document.getElementById('bookingSummary');
    const dateElement = document.getElementById('summaryDate');
    const timeElement = document.getElementById('summaryTime');
    const guestsElement = document.getElementById('summaryGuests');

    if (this.selectedDate && this.selectedTime) {
      const guestCount = document.getElementById('guestCount').value;
      
      dateElement.textContent = this.selectedDate.format('dddd, MMMM Do YYYY');
      timeElement.textContent = this.selectedTime.display;
      guestsElement.textContent = `${guestCount} ${guestCount === '1' ? 'guest' : 'guests'}`;
      
      summaryElement.style.display = 'block';
    } else {
      summaryElement.style.display = 'none';
    }
  }

  updateConfirmButton() {
    const confirmBtn = document.getElementById('confirmBtn');
    const canConfirm = this.selectedDate && this.selectedTime;
    
    confirmBtn.disabled = !canConfirm;
    
    if (canConfirm) {
      confirmBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirm Booking';
    } else {
      confirmBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Select Date & Time';
    }
  }

  initializeEventListeners() {
    // Logout functionality
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      this.logout();
    });

    // Guest count change
    document.getElementById('guestCount')?.addEventListener('change', () => {
      this.updateBookingSummary();
    });

    // Confirm booking
    document.getElementById('confirmBtn')?.addEventListener('click', () => {
      this.confirmBooking();
    });

    // Modal controls
    document.getElementById('closeModal')?.addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('newBooking')?.addEventListener('click', () => {
      this.resetBookingForm();
      this.closeModal();
    });

    // Close modal when clicking outside
    document.getElementById('successModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'successModal') {
        this.closeModal();
      }
    });
  }

  confirmBooking() {
    if (!this.selectedDate || !this.selectedTime) {
      alert('Please select a date and time for your reservation.');
      return;
    }

    const guestCount = document.getElementById('guestCount').value;
    const specialRequests = document.getElementById('specialRequests').value.trim();

    // Generate confirmation number
    const confirmationNumber = 'GF' + Date.now().toString().slice(-6);

    // Create booking object
    const booking = {
      id: Date.now().toString(),
      confirmationNumber,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userPhone: this.currentUser.phone,
      date: this.selectedDate.format('YYYY-MM-DD'),
      time: this.selectedTime.time,
      displayTime: this.selectedTime.display,
      guests: parseInt(guestCount),
      specialRequests,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // Save booking to localStorage (in a real app, this would be sent to a server)
    const bookings = JSON.parse(localStorage.getItem('restaurant_bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('restaurant_bookings', JSON.stringify(bookings));

    // Show success modal
    this.showSuccessModal(booking);
  }

  showSuccessModal(booking) {
    const modal = document.getElementById('successModal');
    const confirmationNumber = document.getElementById('confirmationNumber');
    const confirmationDateTime = document.getElementById('confirmationDateTime');
    const confirmationGuests = document.getElementById('confirmationGuests');

    confirmationNumber.textContent = booking.confirmationNumber;
    confirmationDateTime.textContent = `${this.selectedDate.format('dddd, MMMM Do YYYY')} at ${booking.displayTime}`;
    confirmationGuests.textContent = `${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}`;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  resetBookingForm() {
    // Reset selections
    this.selectedTime = null;
    
    // Clear selected time slots
    document.querySelectorAll('.slot.selected').forEach(btn => {
      btn.classList.remove('selected');
      btn.classList.add('available');
    });

    // Reset form fields
    document.getElementById('guestCount').value = '2';
    document.getElementById('specialRequests').value = '';

    // Update UI
    this.updateBookingSummary();
    this.updateConfirmButton();
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('restaurant_current_user');
      window.location.href = '/';
    }
  }
}

// Initialize booking manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BookingManager();
});