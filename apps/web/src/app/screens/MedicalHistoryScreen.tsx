import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, FileText, Calendar, User, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MedicalHistoryScreen() {
  const navigate = useNavigate();
  const { user, currentPet, medicalRecords, addMedicalRecord } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [veterinarianName, setVeterinarianName] = useState('');

  const petRecords = currentPet
    ? medicalRecords.filter(r => r.petId === currentPet.id)
    : medicalRecords;

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPet) {
      addMedicalRecord({
        petId: currentPet.id,
        date,
        description,
        clinicId: user?.userType === 'clinic' ? user.id : undefined,
        clinicName: user?.userType === 'clinic' ? user.clinicName : undefined,
        veterinarianName: veterinarianName || undefined,
      });
      setDate('');
      setDescription('');
      setVeterinarianName('');
      setShowAddForm(false);
    }
  };

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
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(user?.userType === 'owner' ? '/owner-dashboard' : '/clinic-dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            {(user?.userType === 'clinic' || user?.userType === 'owner') && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Record</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl text-foreground mb-8">Medical History</h1>

        {petRecords.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No medical records yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {petRecords.map((record) => (
              <div key={record.id} className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-foreground">{formatDate(record.date)}</p>
                      {record.clinicName && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="w-4 h-4" />
                          <span>{record.clinicName}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">{record.description}</p>
                    {record.veterinarianName && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <User className="w-4 h-4" />
                        <span>{record.veterinarianName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
          <div className="bg-card rounded-3xl p-6 w-full max-w-md border border-border">
            <h2 className="text-2xl text-foreground mb-6">Add Medical Record</h2>
            <form onSubmit={handleAddRecord}>
              <div className="mb-4">
                <label htmlFor="date" className="block text-foreground mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="veterinarian" className="block text-foreground mb-2">
                  Veterinarian Name
                </label>
                <input
                  type="text"
                  id="veterinarian"
                  value={veterinarianName}
                  onChange={(e) => setVeterinarianName(e.target.value)}
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground"
                  placeholder="Dr. Smith"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="description" className="block text-foreground mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-2xl focus:border-primary focus:outline-none transition-colors text-foreground resize-none"
                  rows={4}
                  placeholder="Describe the consultation or treatment..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-muted hover:bg-muted/70 text-foreground py-3 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-2xl transition-colors"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
