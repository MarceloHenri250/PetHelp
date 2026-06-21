import React, { useState } from 'react';
import { ArrowLeft, Calendar, Download, Eye, FileText, Paperclip, Pencil, Plus, ShieldAlert, Trash2, Upload, X } from 'lucide-react';
import { decodeExamDocument, encodeExamDocument } from '../context/shared';
import { useHealth } from '../context/HealthContext';
import { usePets } from '../context/PetsContext';
import { useAppNavigation } from '../navigation';

type PreviewAttachment = {
  name: string;
  type: string;
  dataUrl: string;
};

function bytesToLabel(size: number) {
  if (!Number.isFinite(size) || size <= 0) return 'Tamanho desconhecido';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateLabel(value: string) {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

function encodeFile(file: File, dataUrl: string): string {
  return encodeExamDocument({
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    dataUrl,
  });
}

function isSupportedFile(file: File) {
  const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  const supportedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const lowerName = file.name.toLowerCase();

  return supportedTypes.includes(file.type) || supportedExtensions.some((extension) => lowerName.endsWith(extension));
}

export default function MedicalHistoryScreen() {
  const { currentPet } = usePets();
  const { medicalRecords, addMedicalRecord, updateMedicalRecord, deleteMedicalRecord } = useHealth();
  const { goToPetContext } = useAppNavigation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalDocuments, setOriginalDocuments] = useState<string[]>([]);
  const [editingDocuments, setEditingDocuments] = useState<string[]>([]);
  const [replaceAttachments, setReplaceAttachments] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<PreviewAttachment | null>(null);
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [treatment, setTreatment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Nenhum pet selecionado</p>
          <button onClick={goToPetContext} className="bg-primary text-white px-6 py-3 rounded-2xl">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const petRecords = medicalRecords.filter((record) => record.petId === currentPet.id);

  const clearForm = () => {
    setEditingId(null);
    setOriginalDocuments([]);
    setEditingDocuments([]);
    setReplaceAttachments(false);
    setPreviewAttachment(null);
    setDate('');
    setDescription('');
    setClinicName('');
    setTreatment('');
    setSelectedFiles([]);
    setShowForm(false);
  };

  const startCreate = () => {
    clearForm();
    setShowForm(true);
  };

  const startEdit = (record: (typeof petRecords)[number]) => {
    setEditingId(record.id);
    const nextDocuments = record.documents ?? [];
    setOriginalDocuments(nextDocuments);
    setEditingDocuments(nextDocuments);
    setReplaceAttachments(false);
    setPreviewAttachment(null);
    setDate(record.date);
    setDescription(record.description);
    setClinicName(record.clinicName || '');
    setTreatment(record.treatment || '');
    setSelectedFiles([]);
    setShowForm(true);
  };

  const removeExistingAttachment = (documentToRemove: string) => {
    setEditingDocuments((prev) => prev.filter((document) => document !== documentToRemove));
  };

  const startReplaceAttachments = () => {
    setReplaceAttachments(true);
    setEditingDocuments([]);
  };

  const cancelReplaceAttachments = () => {
    setReplaceAttachments(false);
    setEditingDocuments(originalDocuments);
  };

  const removeNewAttachment = (fileIndex: number) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== fileIndex));
  };

  const openAttachmentPreview = (attachment: PreviewAttachment) => {
    setPreviewAttachment(attachment);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !description.trim()) return;

    const invalidFile = selectedFiles.find((file) => !isSupportedFile(file));
    if (invalidFile) {
      setFeedback({
        type: 'error',
        message: 'Apenas arquivos PDF, JPG e PNG sao aceitos nos anexos.',
      });
      return;
    }

    setFeedback(null);

    try {
      const newDocuments = await Promise.all(
        selectedFiles.map(async (file) => {
          const dataUrl = await fileToDataUrl(file);
          return encodeFile(file, dataUrl);
        })
      );

      const documents = editingId
        ? replaceAttachments
          ? newDocuments.length > 0
            ? newDocuments
            : undefined
          : [...editingDocuments, ...newDocuments]
        : newDocuments.length > 0
          ? newDocuments
          : undefined;

      const recordPayload = {
        date,
        description: description.trim(),
        clinicName: clinicName.trim() || undefined,
        treatment: treatment.trim() || undefined,
        documents,
      };

      if (editingId) {
        await updateMedicalRecord(editingId, recordPayload);
      } else {
        await addMedicalRecord({
          petId: currentPet.id,
          ...recordPayload,
        });
      }

      setFeedback({
        type: 'success',
        message: editingId ? 'Registro atualizado com sucesso.' : 'Registro criado com sucesso.',
      });
      clearForm();
    } catch (error) {
      console.error('Falha ao salvar registro medico:', error);
      setFeedback({
        type: 'error',
        message: 'Nao foi possivel salvar o registro medico.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={goToPetContext}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Perfil</span>
          </button>
          <button
            onClick={() => (showForm ? clearForm() : startCreate())}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{editingId ? 'Editar Registro' : 'Adicionar Registro'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl text-foreground">Historico Medico</h1>
            <p className="text-muted-foreground">Prontuario clinico cronologico de {currentPet.name}</p>
          </div>
        </div>

        {feedback && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-card rounded-3xl shadow-lg p-6 mb-8 border border-border">
            <h2 className="text-xl text-foreground mb-4">
              {editingId ? 'Editar Evento Clinico' : 'Adicionar Evento Clinico'}
            </h2>
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
                  <label className="block text-sm text-foreground mb-2">Clinica / Hospital (Opcional)</label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="Ex: Clinica Veterinaria Sao Francisco"
                    className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-foreground mb-2">Descricao da Consulta / Sintomas *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o motivo da consulta, diagnostico ou sintomas apresentados..."
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl text-foreground focus:border-primary focus:outline-none min-h-[100px]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-foreground mb-2">Tratamento Prescrito / Medicamentos (Opcional)</label>
                <textarea
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Ex: Antibiotico x de 12h em 12h por 7 dias, repouso..."
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl text-foreground focus:border-primary focus:outline-none min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm text-foreground mb-2">Anexos do exame (Opcional)</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files ?? []))}
                  className="w-full px-4 py-3 bg-input border-2 border-border rounded-xl focus:border-primary focus:outline-none text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
                <p className="mt-2 text-xs text-muted-foreground">Arquivos aceitos: PDF, JPG e PNG.</p>
              </div>

              {editingId && originalDocuments.length > 0 && (
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <div className="flex flex-col gap-3 mb-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-foreground">Anexos atuais</p>
                      <span className="text-xs text-muted-foreground">Clique no nome para visualizar</span>
                    </div>
                    {!replaceAttachments ? (
                      <button
                        type="button"
                        onClick={startReplaceAttachments}
                        className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Substituir anexo
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={cancelReplaceAttachments}
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancelar substituição
                      </button>
                    )}
                  </div>
                  {replaceAttachments ? (
                    <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
                      Modo de substituição ativo. Os anexos atuais serão trocados pelos novos arquivos selecionados ao salvar.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {editingDocuments.map((document) => {
                        const decoded = decodeExamDocument(document);
                        return (
                          <div key={document} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                            <button
                              type="button"
                              onClick={() => decoded && openAttachmentPreview({ name: decoded.name, type: decoded.type, dataUrl: decoded.dataUrl })}
                              className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                              {decoded?.name ?? 'Arquivo anexado'}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeExistingAttachment(document)}
                              className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] text-destructive hover:bg-destructive/15 transition-colors"
                              title="Remover anexo"
                            >
                              Remover
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <p className="text-sm text-foreground mb-2">Novos arquivos selecionados</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={`${file.name}-${file.size}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Paperclip className="w-3.5 h-3.5" />
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNewAttachment(index)}
                          className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] text-destructive hover:bg-destructive/15 transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={clearForm}
                className="px-4 py-2 border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {editingId ? 'Atualizar Registro' : 'Salvar Registro'}
              </button>
            </div>
          </form>
        )}

        {petRecords.length === 0 ? (
          <div className="bg-card rounded-3xl p-8 border border-border text-center">
            <p className="text-muted-foreground">Nenhum evento medico registrado para este pet.</p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-6 before:w-0.5 before:bg-border">
            {petRecords.map((record) => {
              const attachments = (record.documents ?? []).map((document) => ({
                raw: document,
                meta: decodeExamDocument(document),
              }));

              return (
                <div key={record.id} className="relative pl-14 group">
                  <div className="absolute left-[18px] top-1.5 w-3 h-3 rounded-full bg-primary border-4 border-background ring-4 ring-primary/20 group-hover:scale-110 transition-transform" />

                  <div className="bg-card border border-border rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium text-foreground">{record.date}</span>
                        {record.clinicName && (
                          <>
                            <span>�</span>
                            <span>{record.clinicName}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(record)}
                          className="text-muted-foreground hover:text-primary p-1 rounded-lg transition-colors"
                          title="Editar Registro"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Deseja excluir permanentemente este registro medico?')) {
                              void deleteMedicalRecord(record.id);
                            }
                          }}
                          className="text-muted-foreground hover:text-destructive p-1 rounded-lg transition-colors"
                          title="Excluir Registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                      {record.veterinarianName && (
                        <p className="text-xs text-muted-foreground">Veterinario: {record.veterinarianName}</p>
                      )}

                      {attachments.length > 0 && (
                        <div className="pt-3 border-t border-border space-y-3">
                          <p className="text-sm text-foreground flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-primary" />
                            Anexos ({attachments.length})
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {attachments.map((attachment) => {
                              const decoded = attachment.meta;
                              const fileName = decoded?.name ?? 'Arquivo anexado';
                              const fileType = decoded?.type ?? 'Tipo nao informado';
                              const fileSize = decoded?.size ?? 0;

                              return (
                                <div key={attachment.raw} className="rounded-2xl border border-border bg-muted/30 p-4">
                                  <p className="text-sm text-foreground break-words">{fileName}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {fileType} � {bytesToLabel(fileSize)}
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={() => decoded && openAttachmentPreview({ name: fileName, type: fileType, dataUrl: decoded.dataUrl })}
                                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                    >
                                      <Eye className="w-4 h-4" />
                                      Visualizar
                                    </button>
                                    <a
                                      href={decoded?.dataUrl ?? attachment.raw}
                                      download={fileName}
                                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-white hover:bg-primary/90 transition-colors"
                                    >
                                      <Download className="w-4 h-4" />
                                      Baixar
                                    </a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {previewAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewAttachment(null)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-3xl bg-card border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <h3 className="text-lg text-foreground">{previewAttachment.name}</h3>
                <p className="text-xs text-muted-foreground">{previewAttachment.type}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                Fechar
              </button>
            </div>

            <div className="max-h-[80vh] bg-muted/30 p-4">
              {previewAttachment.type.startsWith('image/') ? (
                <img
                  src={previewAttachment.dataUrl}
                  alt={previewAttachment.name}
                  className="mx-auto max-h-[75vh] w-auto max-w-full rounded-2xl border border-border bg-background object-contain"
                />
              ) : (
                <iframe
                  src={previewAttachment.dataUrl}
                  title={previewAttachment.name}
                  className="h-[75vh] w-full rounded-2xl border border-border bg-background"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

