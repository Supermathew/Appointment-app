# Appointment Booking System - Setup Instructions

This document provides detailed instructions to set up and run the appointment booking system locally.

## Prerequisites

- Python 3.8 or higher
- Web browser (Chrome, Firefox, Safari, or Edge)

## Backend Setup

### Step 1: Clone or Download the Project

Clone the repository or extract the provided project files to your local machine.

### Step 2: Set Up a Virtual Environment

Create a Python virtual environment and activate it:

```bash
# Navigate to the project directory
cd appointment_booking

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### Step 4: Apply Database Migrations

```bash
python manage.py makemigrations booking
python manage.py migrate
```

### Step 5: Create an Admin User (Optional)

If you want to access the Django admin panel:

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin username, email, and password.

### Step 6: Run the Development Server

```bash
python manage.py runserver
```

The backend API should now be running at http://localhost:8000/

You can access:
- API endpoints at http://localhost:8000/api/
- Admin panel at http://localhost:8000/admin/ (if you created a superuser)

## Frontend Plugin Setup

### Step 1: Test the Plugin Demo

Navigate to the plugin directory and open `index.html` in your web browser:

Click on the index.html and the website homepage will open directly or you can follow below steps.

```bash
# Open the demo HTML page in your default browser
# On Windows:
start plugin/index.html
# On macOS:
open plugin/index.html
# On Linux:
xdg-open plugin/index.html
```

Make sure your Django backend is running for the demo to work.

### Step 2: Embedding the Plugin in Your Website

1. Copy the `plugin/css` and `plugin/js` directories to your web server or project.

2. Add the following code to your HTML page where you want the booking form to appear:

```html
<!-- Appointment booking plugin container -->
<div id="appointment-booking-plugin"></div>

<!-- Appointment booking plugin script -->
<script src="path/to/js/appointment-plugin.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    new AppointmentBookingPlugin({
      containerId: 'appointment-booking-plugin',
      apiBaseUrl: 'http://localhost:8000/api',  // Update this to your production API URL when deploying
      title: 'Book an Appointment'
    });
  });
</script>
```

## Production Deployment Notes

When deploying to production, make the following changes:

### Backend:

1. Update `settings.py`:
   - Set `DEBUG = False`
   - Update `ALLOWED_HOSTS` with your domain
   - Configure a production database (PostgreSQL recommended)
   - Set a secure `SECRET_KEY`

2. Update CORS settings to only allow your website's domain.

### Frontend:

1. Update the `apiBaseUrl` to point to your production API endpoint.

2. Consider minifying the JavaScript and CSS files for better performance.
