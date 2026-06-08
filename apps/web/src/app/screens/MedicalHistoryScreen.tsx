import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, FileText, Calendar, Trash2, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MedicalHistoryScreen() {
  const navigate = useNavigate();
  const { user, currentPet, medicalRecords, addMedicalRecord, deleteMedicalRecord } = useApp();
  const [showForm, setShowForm] = useState(false);

  // Estados do formulário
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [treatment, setTreatment] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !description) return;

    addMedicalRecord({
      petId: currentPet.id,
      date,
      description,
      clinicName: clinicName || undefined,
      treatment: treatment || undefined,
    });

    // Limpar formulário
    setDate('');
    setDescription('');
    setClinicName('');
    setTreatment('');
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Cabeçalho */}
      <div className="bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Perfil</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Registro</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl text-foreground">Histórico Médico</h1>
            <p className="text-muted-foreground">Prontuário clínico cronológico de {currentPet.name}</p>
          </div>
        </div>

        {/* Formulário de Cadastro */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-card rounded-3xl shadow-lg p-6 mb-8 border border-border">
            <h2 className="text-xl text-foreground mb-4">Adicionar Evento Clínico</h2>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground mb-2">Data do Evento *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl text-foreground focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-2">Clínica / Hospital (Opcional)</label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="Ex: Clínica Veterinária São Francisco"
                    className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-foreground mb-2">Descrição da Consulta / Sintomas *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o motivo da consulta, diagnóstico ou sintomas apresentados..."
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl text-foreground focus:border-primary focus:outline-none min-h-[100px]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-foreground mb-2">Tratamento Prescrito / Medicamentos (Opcional)</label>
                <textarea
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Ex: Antibiótico x de 12h em 12h por 7 dias, repouso..."
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl text-foreground focus:border-primary focus:outline-none min-h-[80px]"
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

        {/* Linha do Tempo de Registros */}
        {petRecords.length === 0 ? (
          <div className="bg-card rounded-3xl p-8 border border-border text-center">
            <p className="text-muted-foreground">Nenhum evento médico registado para este pet.</p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-6 before:w-0.5 before:bg-border">
            {petRecords.map((record) => (
              <div key={record.id} className="relative pl-14 group">
                {/* Marcador da Linha de Tempo */}
                <div className="absolute left-[18px] top-1.5 w-3 h-3 rounded-full bg-primary border-4 border-background ring-4 ring-primary/20 group-hover:scale-110 transition-transform" />

                <div className="bg-card border border-border rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium text-foreground">{record.date}</span>
                      {record.clinicName && (
                        <>
                          <span>•</span>
                          <span>{record.clinicName}</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Deseja excluir permanentemente este registro médico?')) {
                          deleteMedicalRecord(record.id);
                        }
                      }}
                      className="text-muted-foreground hover:text-destructive p-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Excluir Registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p className="text-foreground leading-relaxed">{record.description}</p>
                    {record.treatment && (
                      <div className="bg-muted rounded-xl p-4 border border-border/50">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> Tratamento Recomendado
                        </p>
                        <p className="text-sm text-muted-foreground">{record.treatment}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}