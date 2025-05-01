

(function() {
    const AppointmentBookingPlugin = function(options) {
        this.config = {
            containerId: 'appointment-booking-plugin',
            apiBaseUrl: 'http://localhost:8000/api',
            title: 'Book an Appointment',
            ...options
        };

        this.init();
    };

    AppointmentBookingPlugin.prototype = {
        init: function() {
            this.container = document.getElementById(this.config.containerId);
            if (!this.container) {
                console.error(`Container with ID '${this.config.containerId}' not found`);
                return;
            }

            this.loadStyles();

            this.render();

            this.setupEventListeners();
        },

        loadStyles: function() {
            if (!document.getElementById('appointment-booking-styles')) {
                const link = document.createElement('link');
                link.id = 'appointment-booking-styles';
                link.rel = 'stylesheet';
                link.href = this.getPluginBasePath() + '/css/appointment-plugin.css';
                document.head.appendChild(link);
            }
        },

        getPluginBasePath: function() {
            const scripts = document.getElementsByTagName('script');
            for (let i = 0; i < scripts.length; i++) {
                const src = scripts[i].src;
                if (src.includes('appointment-plugin.js')) {
                    return src.substring(0, src.lastIndexOf('/js'));
                }
            }
            return '.';
        },

        render: function() {
            this.container.innerHTML = `
                <div class="ab-booking-container">
                    <h2>${this.config.title}</h2>
                    <div class="ab-form-group">
                        <label for="ab-date">Select Date:</label>
                        <input type="date" id="ab-date" class="ab-date-picker" min="${this.getCurrentDate()}" required>
                    </div>
                    
                    <div id="ab-slots-section" style="display: none;">
                        <h3>Available Time Slots:</h3>
                        <div id="ab-slots-container" class="ab-slots-container"></div>
                    </div>
                    
                    <div id="ab-booking-form" style="display: none;">
                        <div class="ab-form-group">
                            <label for="ab-name">Your Name:</label>
                            <input type="text" id="ab-name" placeholder="Enter your full name" required>
                        </div>
                        
                        <div class="ab-form-group">
                            <label for="ab-phone">Phone Number:</label>
                            <input type="tel" id="ab-phone" placeholder="Enter your phone number" required>
                        </div>
                        
                        <button id="ab-submit" class="ab-submit-btn" disabled>Book Appointment</button>
                    </div>
                    
                    <div id="ab-message" class="ab-message" style="display: none;"></div>
                </div>
            `;
        },

        setupEventListeners: function() {
            const dateInput = document.getElementById('ab-date');
            dateInput.addEventListener('change', this.fetchAvailableSlots.bind(this));
            
            const submitButton = document.getElementById('ab-submit');
            submitButton.addEventListener('click', this.bookAppointment.bind(this));
        },

        getCurrentDate: function() {
            const today = new Date();
            return today.toISOString().split('T')[0];
        },

        fetchAvailableSlots: function() {
            const dateInput = document.getElementById('ab-date');
            const date = dateInput.value;
            
            if (!date) return;
            
            this.showMessage('Loading available slots...', 'info');
            
            fetch(`${this.config.apiBaseUrl}/available-slots/?date=${date}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch available slots');
                    }
                    return response.json();
                })
                .then(data => {
                    this.renderTimeSlots(data);
                    this.hideMessage();
                })
                .catch(error => {
                    console.error('Error:', error);
                    this.showMessage('Failed to load time slots. Please try again.', 'error');
                });
        },

        renderTimeSlots: function(slots) {
            const slotsContainer = document.getElementById('ab-slots-container');
            const slotsSection = document.getElementById('ab-slots-section');
            
            slotsContainer.innerHTML = '';
            
            if (slots.length === 0) {
                slotsContainer.innerHTML = '<p>No available slots for this date.</p>';
                return;
            }
            
            slots.forEach(slot => {
                const slotElement = document.createElement('div');
                slotElement.className = `ab-time-slot ${slot.available ? '' : 'ab-unavailable'}`;
                
                const [hours, minutes] = slot.time.split(':');
                const formattedTime = this.formatTime(hours, minutes);
                
                slotElement.textContent = formattedTime;
                slotElement.dataset.time = slot.time;
                
                if (slot.available) {
                    slotElement.addEventListener('click', this.selectTimeSlot.bind(this));
                }
                
                slotsContainer.appendChild(slotElement);
            });
            
            slotsSection.style.display = 'block';
        },

        formatTime: function(hours, minutes) {
            const h = parseInt(hours);
            const m = minutes;
            const ampm = h >= 12 ? 'PM' : 'AM';
            const hour12 = h % 12 || 12;
            return `${hour12}:${m} ${ampm}`;
        },

        selectTimeSlot: function(event) {
            const slots = document.querySelectorAll('.ab-time-slot');
            slots.forEach(slot => {
                slot.classList.remove('ab-selected');
            });
            
            event.target.classList.add('ab-selected');
            
            this.selectedTime = event.target.dataset.time;
            
            document.getElementById('ab-booking-form').style.display = 'block';
            
            document.getElementById('ab-submit').disabled = false;
        },

        bookAppointment: function() {
            const dateInput = document.getElementById('ab-date');
            const nameInput = document.getElementById('ab-name');
            const phoneInput = document.getElementById('ab-phone');
            
            if (!dateInput.value || !nameInput.value || !phoneInput.value || !this.selectedTime) {
                this.showMessage('Please fill in all fields and select a time slot.', 'error');
                return;
            }
            
            const appointmentData = {
                name: nameInput.value,
                phone_number: phoneInput.value,
                date: dateInput.value,
                time_slot: this.selectedTime
            };
            
            this.showMessage('Booking your appointment...', 'info');
            document.getElementById('ab-submit').disabled = true;
            
            fetch(`${this.config.apiBaseUrl}/appointments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData),
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(data => {
                            throw new Error(JSON.stringify(data));
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    this.showMessage('Appointment booked successfully!', 'success');
                    
                    this.resetForm();
                    
                    this.fetchAvailableSlots();
                })
                .catch(error => {
                    console.error('Error:', error);
                    let errorMsg = 'Failed to book appointment. Please try again.';
                    
                    try {
                        const errorData = JSON.parse(error.message);
                        if (errorData.time_slot) {
                            errorMsg = `Time slot error: ${errorData.time_slot}`;
                        } else if (errorData.non_field_errors) {
                            errorMsg = errorData.non_field_errors[0];
                        }
                    } catch (e) {
                    }
                    
                    this.showMessage(errorMsg, 'error');
                    document.getElementById('ab-submit').disabled = false;
                });
        },

        resetForm: function() {
            document.getElementById('ab-name').value = '';
            document.getElementById('ab-phone').value = '';
            
            document.getElementById('ab-booking-form').style.display = 'none';
            
            const selectedSlot = document.querySelector('.ab-time-slot.ab-selected');
            if (selectedSlot) {
                selectedSlot.classList.remove('ab-selected');
            }
            
            this.selectedTime = null;
        },

        showMessage: function(message, type = 'info') {
            const messageContainer = document.getElementById('ab-message');
            messageContainer.textContent = message;
            messageContainer.className = `ab-message ${type === 'success' ? 'ab-success' : type === 'error' ? 'ab-error' : ''}`;
            messageContainer.style.display = 'block';
        },

        hideMessage: function() {
            const messageContainer = document.getElementById('ab-message');
            messageContainer.style.display = 'none';
        }
    };

    window.AppointmentBookingPlugin = AppointmentBookingPlugin;
})();