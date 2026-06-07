import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Plus, Clock, MapPin, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AppointmentsScreen() {
  const navigate = useNavigate();
  const { user, currentPet, appointments, addAppointment } = useApp();
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [clinicName, setClinicName] = useState('');

  const userAppointments = user?.userType === 'owner'
    ? appointments.filter(a => a.ownerId === user.id)
    : appointments.filter(a => a.clinicId === user?.id);

  const scheduled = userAppointments.filter(a => a.status === 'scheduled');
  const completed = userAppointments.filter(a => a.status === 'completed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.userType === 'owner' && currentPet) {
      addAppointment({
        petId: currentPet.id,
        petName: currentPet.name,
        clinicId: 'clinic1',
        clinicName,
        date,
        time,
        reason,
        status: 'scheduled',
        ownerId: user.id,
      });
      setShowNewAppointment(false);
      setDate('');
      setTime('');
      setReason('');
      setClinicName('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(user?.userType === 'owner' ? '/owner-dashboard' : '/clinic-dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            {user?.userType === 'owner' && (
              <button
                onClick={() => setShowNewAppointment(true)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Appointment</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl text-foreground mb-8">Appointments</h1>

        {showNewAppointment && (
          <div className="bg-card rounded-3xl shadow-lg p-6 mb-6 border border-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-foreground">Schedule New Appointment</h2>
              <button
                onClick={() => setShowNewAppointment(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-foreground mb-2">Clinic Name</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-input border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                    placeholder="Pet Care Clinic"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-foreground mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-input border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-foreground mb-2">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-input border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground"
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-foreground mb-2">Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground resize-none"
                  rows={3}
                  placeholder="E.g., Annual checkup, vaccination, etc."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl transition-colors"
              >
                Schedule Appointment
              </button>
            </form>
          </div>
        )}

        <div className="bg-card rounded-3xl shadow-lg p-6 mb-6 border border-border">
          <h2 className="text-xl text-foreground mb-4">Scheduled</h2>
          {scheduled.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No scheduled appointments</p>
          ) : (
            <div className="space-y-3">
              {scheduled.map(appointment => (
                <div
                  key={appointment.id}
                  className="bg-muted rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground mb-1">{appointment.petName}</p>
                    <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                    <p className="text-sm text-muted-foreground mt-1">{appointment.clinicName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground">{appointment.date}</p>
                    <p className="text-sm text-muted-foreground">{appointment.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {completed.length > 0 && (
          <div className="bg-card rounded-3xl shadow-lg p-6 border border-border">
            <h2 className="text-xl text-foreground mb-4">Completed</h2>
            <div className="space-y-3">
              {completed.map(appointment => (
                <div
                  key={appointment.id}
                  className="bg-muted rounded-2xl p-4 flex items-center gap-4 opacity-60"
                >
                  <div className="w-12 h-12 bg-muted-foreground/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground mb-1">{appointment.petName}</p>
                    <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                    <p className="text-sm text-muted-foreground mt-1">{appointment.clinicName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground">{appointment.date}</p>
                    <p className="text-sm text-muted-foreground">{appointment.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
