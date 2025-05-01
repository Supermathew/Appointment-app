from rest_framework import serializers
from .models import Appointment
from datetime import datetime, time

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['id', 'name', 'phone_number', 'date', 'time_slot']
    
    def validate(self, data):

        time_slot = data.get('time_slot')
        
        if time_slot < time(10, 0) or time_slot >= time(17, 0):
            raise serializers.ValidationError('Appointments are only available between 10:00 AM and 5:00 PM')
        
        if time(13, 0) <= time_slot < time(14, 0):
            raise serializers.ValidationError('No appointments available during lunch break (1:00 PM - 2:00 PM)')
        
        if time_slot.minute not in [0, 30]:
            raise serializers.ValidationError('Appointments can only be booked at :00 or :30 minute intervals')
        
        date = data.get('date')
        if Appointment.objects.filter(date=date, time_slot=time_slot).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            raise serializers.ValidationError('This time slot is already booked')

        return data


class TimeSlotSerializer(serializers.Serializer):
    time = serializers.TimeField()
    available = serializers.BooleanField()