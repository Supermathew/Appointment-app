from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Appointment
from .serializers import AppointmentSerializer, TimeSlotSerializer
from datetime import datetime, time, timedelta

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

@api_view(['GET'])
def get_available_slots(request):
    """
    Get available time slots for a specific date
    """
    date_str = request.query_params.get('date')
    
    try:
        # Parse date from query parameter
        if date_str:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            date = datetime.now().date()
        
        # Get all appointments for this date
        booked_slots = Appointment.objects.filter(date=date).values_list('time_slot', flat=True)
        
        # Generate all possible slots
        all_slots = []
        
        # Start from 10:00 AM
        slot_time = time(10, 0)
        end_time = time(17, 0)  # 5:00 PM
        
        # Create 30-minute slots
        while slot_time < end_time:
            # Skip lunch break (1:00 PM - 2:00 PM)
            if not (time(13, 0) <= slot_time < time(14, 0)):
                slot = {
                    'time': slot_time,
                    'available': slot_time not in booked_slots
                }
                all_slots.append(slot)
            
            # Add 30 minutes
            hour = slot_time.hour
            minute = slot_time.minute
            minute += 30
            if minute >= 60:
                minute -= 60
                hour += 1
            slot_time = time(hour, minute)
        
        # Serialize and return
        serializer = TimeSlotSerializer(all_slots, many=True)
        return Response(serializer.data)
    
    except ValueError:
        return Response(
            {'error': 'Invalid date format. Use YYYY-MM-DD.'},
            status=status.HTTP_400_BAD_REQUEST
        )