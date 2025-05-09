import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import '../styles/DoctorAvailability.css';

const DoctorAvailability = () => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await api.get('/doctor/availability');
      if (response.data.success) {
        setAvailability(response.data.data);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to fetch availability');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading availability');
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (day) => {
    setSelectedDay(day);
  };

  const handleWorkingDayToggle = async (day) => {
    try {
      setSaving(true);
      const dayData = availability.find(a => a.dayOfWeek === day);
      const response = await api.put(`/doctor/availability/${day}`, {
        ...dayData,
        isWorkingDay: !dayData.isWorkingDay
      });

      if (response.data.success) {
        setAvailability(prev => prev.map(a => 
          a.dayOfWeek === day ? response.data.data : a
        ));
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating working day');
    } finally {
      setSaving(false);
    }
  };

  const handleSlotToggle = async (day, slotIndex) => {
    try {
      setSaving(true);
      const dayData = availability.find(a => a.dayOfWeek === day);
      const updatedTimeSlots = dayData.timeSlots.map((slot, index) => 
        index === slotIndex ? { ...slot, isAvailable: !slot.isAvailable } : slot
      );

      const response = await api.put(`/doctor/availability/${day}`, {
        ...dayData,
        timeSlots: updatedTimeSlots
      });

      if (response.data.success) {
        setAvailability(prev => prev.map(a => 
          a.dayOfWeek === day ? response.data.data : a
        ));
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating time slot');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const selectedDayData = availability.find(a => a.dayOfWeek === selectedDay);

  return (
    <div className="availability-container">
      <h2>Manage Your Availability</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="days-nav">
        {availability.map(day => (
          <button
            key={day.dayOfWeek}
            className={`day-button ${selectedDay === day.dayOfWeek ? 'active' : ''} ${!day.isWorkingDay ? 'non-working' : ''}`}
            onClick={() => handleDayChange(day.dayOfWeek)}
          >
            {day.dayOfWeek}
          </button>
        ))}
      </div>

      {selectedDayData && (
        <div className="day-schedule">
          <div className="day-header">
            <h3>{selectedDayData.dayOfWeek}</h3>
            <label className="working-day-toggle">
              <input
                type="checkbox"
                checked={selectedDayData.isWorkingDay}
                onChange={() => handleWorkingDayToggle(selectedDayData.dayOfWeek)}
                disabled={saving}
              />
              Working Day
            </label>
          </div>

          <div className="time-slots">
            {selectedDayData.timeSlots.map((slot, index) => (
              <div 
                key={index}
                className={`time-slot ${slot.isAvailable ? 'available' : ''} ${saving ? 'disabled' : ''}`}
                onClick={() => !saving && handleSlotToggle(selectedDayData.dayOfWeek, index)}
              >
                <span className="time">{slot.startTime} - {slot.endTime}</span>
                <span className="status">{slot.isAvailable ? 'Available' : 'Unavailable'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAvailability; 