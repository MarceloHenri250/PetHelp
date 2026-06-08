import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Syringe, Calendar, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function VaccinationScreen() {
  const navigate = useNavigate();
  const { user, currentPet, vaccines, addVaccine, deleteVaccine } = useApp();
  const [showForm, setShowForm] = useState(false);
  
  // Estados do formulário
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [nextDose, setNextDose] = useState('');
  const [veterinarian, setVeterinarian] = useState('');

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

  const petVaccines = vaccines.filter(v => v.petId === currentPet.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;

    addVaccine({
      petId: currentPet.id,
      name,
      date,
      nextDose: nextDose || undefined,
      veterinarian: veterinarian || undefined,
    });

    // Limpar formulário
    setName('');
    setDate('');
    setNextDose('');
    setVeterinarian('');
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Cabeçalho */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Perfil</span>
          </button>
          {user?.userType === 'owner' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Vacina</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Syringe className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl text-foreground">Carteira de Vacinação</h1>
            <p className="text-muted-foreground">Histórico de imunização de {currentPet.name}</p>
          </div>
        </div>

        {/* Formulário de Cadastro (Se aberto) */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-card rounded-3xl shadow-lg p-6 mb-8 border border-border">
            <h2 className="text-xl text-foreground mb-4">Nova Vacina</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-foreground mb-2">Nome da Vacina *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Quádrupla Felina (V4), Antirrábica"
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl text-foreground focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-2">Data de Aplicação *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl text-foreground focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-2">Próxima Dose / Reforço (Opcional)</label>
                <input
                  type="date"
                  value={nextDose}
                  onChange={(e) => setNextDose(e.target.value)}
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-2">Veterinário Responsável (Opcional)</label>
                <input
                  type="text"
                  value={veterinarian}
                  onChange={(e) => setVeterinarian(e.target.value)}
                  placeholder="Nome do profissional ou CRMV"
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
              >
                Salvar Registro
              </button>
            </div>
          </form>
        )}

        {/* Lista de Vacinas */}
        {petVaccines.length === 0 ? (
          <div className="bg-card rounded-3xl p-8 border border-border text-center">
            <p className="text-muted-foreground">Nenhuma vacina registrada para este pet.</p>
          </div>
        ) : (
          <div className="bg-card rounded-3xl shadow-lg overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-muted border-b border-border text-muted-foreground text-sm font-medium">
                    <th className="p-4">Vacina</th>
                    <th className="p-4">Data de Aplicação</th>
                    <th className="p-4">Próxima Dose</th>
                    <th className="p-4">Veterinário</th>
                    {user?.userType === 'owner' && <th className="p-4 text-right">Ações</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {petVaccines.map((vaccine) => (
                    <tr key={vaccine.id} className="hover:bg-muted/50 transition-colors text-foreground">
                      <td className="p-4 font-medium flex items-center gap-2">
                        <Syringe className="w-4 h-4 text-primary" />
                        {vaccine.name}
                      </td>
                      <td className="p-4">{vaccine.date}</td>
                      <td className="p-4">
                        {vaccine.nextDose ? (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {vaccine.nextDose}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Dose Única / Concluída</span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {vaccine.veterinarian || 'Não informado'}
                      </td>
                      {user?.userType === 'owner' && (
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Remover o registro da vacina ${vaccine.name}?`)) {
                                deleteVaccine(vaccine.id);
                              }
                            }}
                            className="text-destructive hover:text-destructive/80 p-1 rounded-lg transition-colors"
                            title="Excluir Vacina"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}