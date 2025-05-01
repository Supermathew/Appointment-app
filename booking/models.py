from django.db import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError

class Appointment(models.Model):
    name = models.CharField(max_length=500)
    
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17)
    
    date = models.DateField()
    time_slot = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['date', 'time_slot']
    
    def __str__(self):
        return f"{self.name} - {self.date} {self.time_slot}"
    
    def clean(self):
        from datetime import time
        
        if self.time_slot < time(10, 0) or self.time_slot >= time(17, 0):
            raise ValidationError('Appointments are only available between 10:00 AM and 5:00 PM')
        
        if time(13, 0) <= self.time_slot < time(14, 0):
            raise ValidationError('No appointments available during lunch break (1:00 PM - 2:00 PM)')
        
        if self.time_slot.minute not in [0, 30]:
            raise ValidationError('Appointments can only be booked at :00 or :30 minute intervals')
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)