import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { MEDICAL_SPECIALIZATIONS } from '../constants/specializations';
import '../styles/DoctorSearch.css';

const DoctorSearch = ({ onBack }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentType, setAppointmentType] = useState('in-person');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search when debounced search term or specialization changes
  useEffect(() => {
    searchDoctors();
  }, [debouncedSearchTerm, selectedSpecialization]);

  // Add effect to initialize Feather icons when modals are shown
  useEffect(() => {
    if (showAvailabilityModal || showBookingModal) {
      // Initialize Feather icons
      if (window.feather) {
        window.feather.replace();
      }
    }
  }, [showAvailabilityModal, showBookingModal]);

  const searchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/patient/search-doctors', {
        params: {
          name: debouncedSearchTerm,
          specialization: selectedSpecialization
        }
      });
      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error searching doctors');
      console.error('Error searching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (doctor) => {
    setSelectedDoctor(doctor);
    setShowAvailabilityModal(true);
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setLoadingAvailability(true);
    try {
      const response = await api.get(`/patient/doctor-availability/${selectedDoctor._id}`, {
        params: { date }
      });
      if (response.data.success) {
        setAvailability(response.data.data);
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching doctor availability');
      console.error('Error fetching doctor availability:', err);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleSelectTimeSlot = (slot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleBookSlot = async () => {
    try {
      const response = await api.post('/patient/book-appointment', {
        doctorId: selectedDoctor._id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        type: appointmentType
      });

      if (response.data.success) {
        // Refresh availability
        const availabilityResponse = await api.get(`/patient/doctor-availability/${selectedDoctor._id}`, {
          params: { date: selectedDate }
        });
        if (availabilityResponse.data.success) {
          setAvailability(availabilityResponse.data.data);
        }
        setShowBookingModal(false);
        setSelectedSlot(null);
        setAppointmentType('in-person');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error booking appointment');
      console.error('Error booking appointment:', err);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSpecializationChange = (e) => {
    setSelectedSpecialization(e.target.value);
  };

  const handleCloseModal = () => {
    setShowAvailabilityModal(false);
    setShowBookingModal(false);
    setSelectedDoctor(null);
    setAvailability(null);
    setSelectedDate('');
    setSelectedSlot(null);
    setAppointmentType('in-person');
  };

  return (
    <div className="doctor-search">
      <div className="search-header">
        <button onClick={onBack} className="back-button">
          <i data-feather="arrow-left"></i>
          Back to Dashboard
        </button>
        <h2>Find a Doctor</h2>
      </div>

      <div className="search-container">
        <form className="search-form">
          <div className="search-inputs">
            <div className="search-field">
              <label>Doctor Name</label>
              <input
                type="text"
                placeholder="Search doctors by name..."
                value={searchTerm}
                onChange={handleInputChange}
              />
            </div>
            <div className="search-field">
              <label>Specialization</label>
              <select
                value={selectedSpecialization}
                onChange={handleSpecializationChange}
              >
                <option value="">All Specializations</option>
                {MEDICAL_SPECIALIZATIONS.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Searching for doctors...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="doctors-grid">
          {doctors.map(doctor => (
            <div key={doctor._id} className="doctor-card">
              <div className="doctor-avatar">
                <img src="https://i.pravatar.cc/150" alt={doctor.name} />
              </div>
              <div className="doctor-info">
                <div className="doctor-info-left">
                  <h3>Dr. {doctor.name}</h3>
                  <p className="specialization">
                    <i data-feather="user"></i>
                    {doctor.doctorDetails.specialization}
                  </p>
                  <p className="experience">
                    <i data-feather="award"></i>
                    {doctor.doctorDetails.yearsOfExperience} years of experience
                  </p>
                  <p className="languages">
                    <i data-feather="message-circle"></i>
                    Speaks: {doctor.doctorDetails.languages?.join(', ')}
                  </p>
                </div>
                <div className="doctor-actions">
                  <p className="consultation-fee">
                    <i data-feather="dollar-sign"></i>
                    ${doctor.doctorDetails.consultationFee}
                  </p>
                  <button
                    className="btn btn-primary book-btn"
                    onClick={() => handleBookAppointment(doctor)}
                  >
                    <i data-feather="calendar"></i>
                    Book Now
                  </button>
                </div>
                {doctor.doctorDetails.bio && (
                  <p className="bio">{doctor.doctorDetails.bio}</p>
                )}
              </div>
            </div>
          ))}
          {!loading && doctors.length === 0 && (
            <div className="no-results">
              <i data-feather="search"></i>
              <p>No doctors found matching your search criteria</p>
              <small>Try adjusting your search terms or specialization</small>
            </div>
          )}
        </div>
      )}

      {showAvailabilityModal && selectedDoctor && (
        <div className="availability-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Dr. {selectedDoctor.name}'s Availability</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                <i data-feather="x"></i>
              </button>
            </div>

            <div className="date-picker">
              <label>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {loadingAvailability ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading availability...</p>
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : availability ? (
              <>
                <div className="availability-info">
                  <p>Available slots for {new Date(availability.date).toLocaleDateString()}</p>
                  <p className="consultation-fee">
                    Consultation Fee: ${availability.doctor.consultationFee}
                  </p>
                </div>

                <div className="time-slots">
                  {availability.availableSlots.length > 0 ? (
                    availability.availableSlots.map((slot, index) => (
                      <div key={index} className="time-slot available">
                        <span className="time">{slot.startTime} - {slot.endTime}</span>
                        <button 
                          className="btn btn-primary select-slot"
                          onClick={() => handleSelectTimeSlot(slot)}
                        >
                          Select
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-slots">
                      <p>No available slots for this date</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-availability">
                <p>Please select a date to view availability</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showBookingModal && selectedSlot && (
        <div className="booking-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Book Appointment</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                <i data-feather="x"></i>
              </button>
            </div>

            <div className="booking-details">
              <p><strong>Doctor:</strong> Dr. {selectedDoctor.name}</p>
              <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {selectedSlot.startTime} - {selectedSlot.endTime}</p>
              <p><strong>Fee:</strong> ${selectedDoctor.doctorDetails.consultationFee}</p>
            </div>

            <div className="appointment-type">
              <label>Appointment Type:</label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
              >
                <option value="in-person">In-Person</option>
                <option value="tele-consult">Tele-Consultation</option>
              </select>
            </div>

            <div className="booking-actions">
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleBookSlot}>
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSearch; 