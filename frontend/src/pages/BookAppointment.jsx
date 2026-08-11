import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookAppointment.css';

const doctors = [
  { id: 1, name: 'Dr. Sarah Jenkins', specialty: 'Cardiology', rating: 4.9, reviews: 124, nextAvailable: 'Tomorrow, 9:00 AM' },
  { id: 2, name: 'Dr. Michael Chang', specialty: 'Neurology', rating: 4.8, reviews: 89, nextAvailable: 'Oct 12, 2:30 PM' },
  { id: 3, name: 'Dr. Ananya Patel', specialty: 'Pediatrics', rating: 5.0, reviews: 210, nextAvailable: 'Today, 4:15 PM' },
];

const timeSlots = ['9:00 AM', '9:30 AM', '10:00 AM', '11:00 AM', '2:00 PM', '2:30 PM', '3:00 PM', '4:15 PM'];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  function pickDoctor(doctor) {
    setSelectedDoctor(doctor);
    setStep(2);
  }

  function confirmDateTime() {
    if (!selectedDate || !selectedTime) return;
    setStep(3);
  }

  function finishBooking() {
    // Backend appointment creation endpoint not built yet — placeholder for now
    navigate('/patient/dashboard');
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
              placeholder="Search by name, specialty, or condition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="doctor-grid">
              {filteredDoctors.map((doc) => (
                <div className="doctor-card" key={doc.id}>
                  <div className="doctor-card-top">
                    <div className="doctor-avatar">{doc.name.split(' ')[1]?.charAt(0)}</div>
                    <div>
                      <div className="doctor-name">{doc.name}</div>
                      <div className="doctor-specialty">{doc.specialty}</div>
                      <div className="doctor-rating">★ {doc.rating} ({doc.reviews} reviews)</div>
                    </div>
                  </div>
                  <div className="doctor-card-bottom">
                    <div>
                      <div className="next-available-label">Next Available</div>
                      <div className="next-available-value">{doc.nextAvailable}</div>
                    </div>
                    <button className="doctor-select-btn" onClick={() => pickDoctor(doc)}>→</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedDoctor && (
          <div className="book-step-body">
            <h2 className="step-title">Pick a Date & Time</h2>
            <p className="step-subtitle">Booking with {selectedDoctor.name} · {selectedDoctor.specialty}</p>

            <label className="date-label">Date</label>
            <input
              type="date"
              className="date-input"
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
                <span className="confirm-value">{selectedDoctor.name}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Specialty</span>
                <span className="confirm-value">{selectedDoctor.specialty}</span>
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

            <button className="continue-btn" onClick={finishBooking}>
              Confirm Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
}