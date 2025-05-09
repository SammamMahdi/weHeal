import { useNavigate } from 'react-router-dom';

const AppointmentDetails = ({ appointment }) => {
  const navigate = useNavigate();

  const handleStartVideoCall = () => {
    navigate(`/video-call/${appointment._id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* ... existing appointment details ... */}
      
      {appointment.type === 'tele-consult' && 
       appointment.status === 'confirmed' && 
       new Date(appointment.appointmentDate) <= new Date() && (
        <button
          onClick={handleStartVideoCall}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Start Video Call
        </button>
      )}
      
      {/* ... rest of the component ... */}
    </div>
  );
};

export default AppointmentDetails; 