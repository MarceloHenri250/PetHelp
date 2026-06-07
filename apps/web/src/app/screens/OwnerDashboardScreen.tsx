import React from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Syringe, FileText, Bell, LogOut, Link, PawPrint, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function OwnerDashboardScreen() {
  const navigate = useNavigate();
  const { user, currentPet, appointments, vaccines, notifications, logout } = useApp();

  const upcomingAppointments = appointments
    .filter(a => a.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const overdueVaccines = vaccines.filter(v => v.status === 'late');
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <PawPrint className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl text-foreground mb-2">No Pet Registered</h2>
          <p className="text-muted-foreground mb-6">Please register a pet to continue</p>
          <button
            onClick={() => navigate('/pet-registration')}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl transition-colors"
          >
            Register Pet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl text-foreground">Pet Help</h1>
                <p className="text-sm text-muted-foreground">{user?.name}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <Bell className="w-6 h-6 text-foreground" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <LogOut className="w-6 h-6 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card rounded-3xl shadow-lg p-6 mb-6 border border-border">
          <div className="flex items-start gap-4">
            <img
              src={currentPet.photo}
              alt={currentPet.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-primary"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-2xl text-foreground mb-1">{currentPet.name}</h2>
                  <p className="text-muted-foreground">{currentPet.breed}</p>
                </div>
                <button
                  onClick={() => navigate('/pet-profile')}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  View Profile
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Age</p>
                  <p className="text-foreground">{currentPet.age}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="text-foreground">{currentPet.weight}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {overdueVaccines.length > 0 && (
          <div className="bg-primary/10 border border-primary rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-foreground mb-1">Vaccines Overdue</h3>
              <p className="text-sm text-muted-foreground">
                {overdueVaccines.length} vaccine{overdueVaccines.length > 1 ? 's' : ''} need attention
              </p>
            </div>
            <button
              onClick={() => navigate('/vaccines')}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/vaccines')}
            className="bg-card hover:bg-muted border border-border rounded-2xl p-6 text-left transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Syringe className="w-6 h-6 text-primary" />
              </div>
              {overdueVaccines.length > 0 ? (
                <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">
                  {overdueVaccines.length} late
                </span>
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            <h3 className="text-lg text-foreground mb-1">Vaccines</h3>
            <p className="text-sm text-muted-foreground">Manage vaccination records</p>
          </button>

          <button
            onClick={() => navigate('/medical-history')}
            className="bg-card hover:bg-muted border border-border rounded-2xl p-6 text-left transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="text-lg text-foreground mb-1">Medical History</h3>
            <p className="text-sm text-muted-foreground">View past consultations</p>
          </button>

          <button
            onClick={() => navigate('/appointments')}
            className="bg-card hover:bg-muted border border-border rounded-2xl p-6 text-left transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              {upcomingAppointments.length > 0 && (
                <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">
                  {upcomingAppointments.length}
                </span>
              )}
            </div>
            <h3 className="text-lg text-foreground mb-1">Appointments</h3>
            <p className="text-sm text-muted-foreground">Schedule & manage visits</p>
          </button>

          <button
            onClick={() => navigate('/connection')}
            className="bg-card hover:bg-muted border border-border rounded-2xl p-6 text-left transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Link className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="text-lg text-foreground mb-1">Link to Clinic</h3>
            <p className="text-sm text-muted-foreground">Connect with your vet</p>
          </button>
        </div>

        {upcomingAppointments.length > 0 && (
          <div className="bg-card rounded-3xl shadow-lg p-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-foreground">Upcoming Appointments</h3>
              <button
                onClick={() => navigate('/appointments')}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {upcomingAppointments.map(appointment => (
                <div
                  key={appointment.id}
                  className="bg-muted rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground mb-1">{appointment.reason}</p>
                    <p className="text-sm text-muted-foreground">{appointment.clinicName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">{appointment.date}</p>
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
