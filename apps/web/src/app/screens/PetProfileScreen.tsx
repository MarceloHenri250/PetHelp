import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, FileText, Syringe, AlertCircle, Edit } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PetProfileScreen() {
  const navigate = useNavigate();
  const { user, currentPet, medicalRecords, vaccines, deletePet } = useApp();

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Nenhum pet selecionado</p>
          <button
            onClick={() => navigate(user?.userType === 'owner' ? '/owner-dashboard' : '/clinic-dashboard')}
            className="bg-primary text-white px-6 py-3 rounded-2xl"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const petRecords = medicalRecords.filter(r => r.petId === currentPet.id);
  const petVaccines = vaccines.filter(v => v.petId === currentPet.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(user?.userType === 'owner' ? '/owner-dashboard' : '/clinic-dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card rounded-3xl shadow-lg p-8 mb-6 border border-border">
          <div className="flex items-start gap-6 mb-8">
            <img
              src={currentPet.photo}
              alt={currentPet.name}
              className="w-32 h-32 rounded-2xl object-cover border-4 border-primary"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl text-foreground mb-2">Perfil de {currentPet.name}</h1>
                  <p className="text-xl text-muted-foreground">{currentPet.species ? `${currentPet.species} - ` : ''}{currentPet.breed || 'Raça não informada'}</p>
                </div>
                {user?.userType === 'owner' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/pet-registration', { state: { mode: 'edit' } })}
                      className="text-primary hover:text-primary/80 transition-colors"
                      title="Editar Pet"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={async () => {
                        if (!currentPet) return;
                        if (confirm(`Tem certeza que deseja excluir o perfil de ${currentPet.name}?`)) {
                          try {
                            await deletePet(currentPet.id);
                            navigate('/owner-dashboard');
                          } catch (err) {
                            console.error('Erro ao excluir pet:', err);
                          }
                        }
                      }}
                      className="text-destructive hover:text-destructive/80 transition-colors" title="Excluir Pet"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Idade</p>
                  <p className="text-lg text-foreground">{currentPet.age || 'Não informada'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Peso</p>
                  <p className="text-lg text-foreground">{currentPet.weight || 'Não informado'}</p>
                </div>
              </div>

              {((currentPet.allergies && currentPet.allergies.length > 0) || (currentPet.conditions && currentPet.conditions.length > 0)) && (
                <div className="mt-6 pt-6 border-t border-border space-y-4">
                  {currentPet.allergies && currentPet.allergies.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-primary" /> Alergias
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {currentPet.allergies.map((allergy, i) => (
                          <span key={i} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">{allergy}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentPet.conditions && currentPet.conditions.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Condições Médicas</p>
                      <div className="flex flex-wrap gap-2">
                        {currentPet.conditions.map((condition, i) => (
                          <span key={i} className="text-sm bg-muted text-foreground px-3 py-1 rounded-full border border-border">{condition}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/medical-history')}
            className="bg-card hover:bg-muted border border-border rounded-2xl p-6 text-left transition-colors group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors mb-3">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg text-foreground mb-1">Histórico Médico</h3>
            <p className="text-sm text-muted-foreground">{petRecords.length} registros</p>
          </button>

          <button
            onClick={() => navigate('/vaccines')}
            className="bg-card hover:bg-muted border border-border rounded-2xl p-6 text-left transition-colors group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors mb-3">
              <Syringe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg text-foreground mb-1">Vacinação</h3>
            <p className="text-sm text-muted-foreground">{petVaccines.length} vacinas</p>
          </button>

          <button
            onClick={() => navigate('/appointments')}
            className="bg-card hover:bg-muted border border-border rounded-2xl p-6 text-left transition-colors group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors mb-3">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg text-foreground mb-1">Consultas</h3>
            <p className="text-sm text-muted-foreground">Agendar visitas</p>
          </button>
        </div>

        {petRecords.length > 0 && (
          <div className="bg-card rounded-3xl shadow-lg p-6 mb-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl text-foreground">Histórico Médico Recente</h2>
              <button
                onClick={() => navigate('/medical-history')}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Ver Todos
              </button>
            </div>
            <div className="space-y-3">
              {petRecords.slice(0, 3).map(record => (
                <div key={record.id} className="bg-muted rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-foreground">{record.date}</p>
                    {record.clinicName && (
                      <p className="text-sm text-muted-foreground">{record.clinicName}</p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{record.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}