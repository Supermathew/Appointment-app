from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone_number', 'date', 'time_slot', 'created_at')
    list_filter = ('date', 'time_slot')
    search_fields = ('name', 'phone_number')
    ordering = ('date', 'time_slot')