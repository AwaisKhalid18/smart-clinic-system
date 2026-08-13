import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import './BookAppointment.css';

const timeSlots = ['9:00 AM', '9:30 AM', '10:00 AM', '11:00 AM', '2:00 PM', '2:30 PM', '3:00 PM', '4:15 PM'];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await api.get('/doctors');
        setDoctors(res.data);
      } catch (err) {
        toast.error('Failed to load doctors');
      } finally {
        setLoadingDoctors(false);
      }
    }
    loadDoctors();
  }, []);

  const filteredDoctors = doctors.filter(
    (d) =>
      d.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (d.specialty || '').toLowerCase().includes(search.toLowerCase())
  );

  function pickDoctor(doctor) {
    setSelectedDoctor(doctor);
    setStep(2);
  }

  function confirmDateTime() {
    if (!selectedDate || !selectedTime) return;
    setStep(3);
  }

  function timeTo24Hour(time) {
    const [t, meridiem] = time.split(' ');
    let [hours, minutes] = t.split(':').map(Number);
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  }

  async function finishBooking() {
    setSubmitting(true);
    try {
      const isoDateTime = new Date(`${selectedDate}T${timeTo24Hour(selectedTime)}`).toISOString();

      await api.post('/appointments', {
        doctorId: selectedDoctor.id,
        dateTime: isoDateTime,
      });

      toast.success('Appointment booked');
      navigate('/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="book-modal-overlay">
      <div className="book-modal">
        <div className="book-modal-header">
          <button className="book-back-btn" onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}>
            ←
          </button>
          <span className="book-modal-title">Book Appointment</span>
          <button className="book-close-btn" onClick={() => navigate(-1)}>×</button>
        </div>

        <div className="book-stepper">
          <div className={`stepper-item ${step >= 1 ? 'active' : ''}`}>
            <div className="stepper-circle">1</div>
            <span>Select Doctor</span>
          </div>
          <div className={`stepper-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`stepper-item ${step >= 2 ? 'active' : ''}`}>
            <div className="stepper-circle">2</div>
            <span>Date & Time</span>
          </div>
          <div className={`stepper-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`stepper-item ${step >= 3 ? 'active' : ''}`}>
            <div className="stepper-circle">3</div>
            <span>Confirmation</span>
          </div>
        </div>

        {step === 1 && (
          <div className="book-step-body">
            <h2 className="step-title">Choose a Specialist</h2>
            <p className="step-subtitle">Select a healthcare professional from our network to proceed with booking your appointment.</p>

            <input
              className="doctor-search"
              placeholder="Search by name or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {loadingDoctors ? (
              <p>Loading doctors...</p>
            ) : filteredDoctors.length === 0 ? (
              <p>No doctors found.</p>
            ) : (
              <div className="doctor-grid">
                {filteredDoctors.map((doc) => (
                  <div className="doctor-card" key={doc.id}>
                    <div className="doctor-card-top">
                      <div className="doctor-avatar">{doc.fullName.charAt(0)}</div>
                      <div>
                        <div className="doctor-name">{doc.fullName}</div>
                        <div className="doctor-specialty">{doc.specialty || 'General'}</div>
                      </div>
                    </div>
                    <div className="doctor-card-bottom">
                      <div>
                        <div className="next-available-label">Available</div>
                        <div className="next-available-value">Select a time next</div>
                      </div>
                      <button className="doctor-select-btn" onClick={() => pickDoctor(doc)}>→</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && selectedDoctor && (
          <div className="book-step-body">
            <h2 className="step-title">Pick a Date & Time</h2>
            <p className="step-subtitle">Booking with {selectedDoctor.fullName} · {selectedDoctor.specialty || 'General'}</p>

            <label className="date-label">Date</label>
            <input
              type="date"
              className="date-input"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <label className="date-label">Available Times</label>
            <div className="time-grid">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>

            <button className="continue-btn" onClick={confirmDateTime} disabled={!selectedDate || !selectedTime}>
              Continue
            </button>
          </div>
        )}

        {step === 3 && selectedDoctor && (
          <div className="book-step-body">
            <h2 className="step-title">Confirm Appointment</h2>
            <p className="step-subtitle">Please review the details before confirming.</p>

            <div className="confirm-summary">
              <div className="confirm-row">
                <span className="confirm-label">Doctor</span>
                <span className="confirm-value">{selectedDoctor.fullName}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Specialty</span>
                <span className="confirm-value">{selectedDoctor.specialty || 'General'}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Date</span>
                <span className="confirm-value">{selectedDate}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Time</span>
                <span className="confirm-value">{selectedTime}</span>
              </div>
            </div>

            <button className="continue-btn" onClick={finishBooking} disabled={submitting}>
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}