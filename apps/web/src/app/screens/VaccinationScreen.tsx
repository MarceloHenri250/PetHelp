import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2, AlertCircle, Calendar, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function VaccinationScreen() {
  const navigate = useNavigate();
  const { user, currentPet, vaccines } = useApp();

  const petVaccines = currentPet
    ? vaccines.filter(v => v.petId === currentPet.id)
    : vaccines;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(user?.userType === 'owner' ? '/owner-dashboard' : '/clinic-dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl text-foreground mb-6">Vaccinations</h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-muted-foreground text-sm mb-1">Up to Date</p>
            <p className="text-foreground text-2xl">
              {petVaccines.filter(v => v.status === 'up-to-date').length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-muted-foreground text-sm mb-1">Overdue</p>
            <p className="text-primary text-2xl">
              {petVaccines.filter(v => v.status === 'late').length}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {petVaccines.map((vaccine) => (
            <div key={vaccine.id} className="bg-card rounded-2xl p-6 shadow-lg border border-border">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                  vaccine.status === 'up-to-date' ? 'bg-green-500/10' : 'bg-primary/10'
                }`}>
                  {vaccine.status === 'up-to-date' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-primary" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg text-foreground">{vaccine.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      vaccine.status === 'up-to-date'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {vaccine.status === 'up-to-date' ? 'Up to Date' : 'Overdue'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Applied:</span>
                      <span className="text-foreground">{formatDate(vaccine.appliedDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Next Dose:</span>
                      <span className={vaccine.status === 'late' ? 'text-primary' : 'text-foreground'}>
                        {formatDate(vaccine.nextDose)}
                      </span>
                    </div>
                    {vaccine.clinicName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{vaccine.clinicName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
