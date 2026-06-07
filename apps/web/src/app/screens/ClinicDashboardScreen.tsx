import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, LogOut, PawPrint, Building2, Search, Plus, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ClinicDashboardScreen() {
  const navigate = useNavigate();
  const { user, pets, appointments, logout, setCurrentPet } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const todayAppointments = appointments.filter(
    a => a.status === 'scheduled' && a.date === new Date().toISOString().split('T')[0]
  );

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewPet = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      setCurrentPet(pet);
      navigate('/pet-profile');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl text-foreground">{user?.clinicName || 'Pet Help'}</h1>
                <p className="text-sm text-muted-foreground">Clinic Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-muted rounded-xl transition-colors"
            >
              <LogOut className="w-6 h-6 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl text-foreground">{pets.length}</p>
                <p className="text-sm text-muted-foreground">Registered Pets</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl text-foreground">{todayAppointments.length}</p>
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/appointments')}
            className="bg-primary hover:bg-primary/90 rounded-2xl p-6 text-white transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-lg">New Appointment</p>
                <p className="text-sm opacity-90">Schedule a visit</p>
              </div>
            </div>
          </button>
        </div>

        <div className="bg-card rounded-3xl shadow-lg p-6 mb-6 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <QrCode className="w-6 h-6 text-primary" />
            <div className="flex-1">
              <h3 className="text-lg text-foreground">Clinic Connection Code</h3>
              <p className="text-sm text-muted-foreground">Share this code with pet owners to connect</p>
            </div>
          </div>
          <div className="bg-muted rounded-2xl p-4 text-center">
            <p className="text-3xl text-primary tracking-wider">{user?.connectionCode}</p>
          </div>
        </div>

        <div className="bg-card rounded-3xl shadow-lg p-6 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl text-foreground">Patient Records</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pets..."
                className="pl-10 pr-4 py-2 bg-input border border-border rounded-xl focus:border-primary focus:outline-none transition-colors text-foreground w-64"
              />
            </div>
          </div>

          {filteredPets.length === 0 ? (
            <div className="text-center py-12">
              <PawPrint className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No pets found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPets.map(pet => (
                <button
                  key={pet.id}
                  onClick={() => handleViewPet(pet.id)}
                  className="bg-muted hover:bg-muted/70 rounded-2xl p-4 text-left transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={pet.photo}
                      alt={pet.name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-primary/20 group-hover:border-primary transition-colors"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-foreground truncate">{pet.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">{pet.breed}</p>
                      <div className="flex gap-3 mt-2">
                        <p className="text-xs text-muted-foreground">{pet.age}</p>
                        <p className="text-xs text-muted-foreground">{pet.weight}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {todayAppointments.length > 0 && (
          <div className="bg-card rounded-3xl shadow-lg p-6 mt-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-foreground">Today's Schedule</h3>
              <button
                onClick={() => navigate('/appointments')}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {todayAppointments.map(appointment => (
                <div
                  key={appointment.id}
                  className="bg-muted rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PawPrint className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground mb-1">{appointment.petName}</p>
                    <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground">{appointment.time}</p>
                    <p className="text-sm text-muted-foreground">{appointment.status}</p>
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
