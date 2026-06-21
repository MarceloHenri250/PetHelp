import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Copy, Download, Eye, FileText, Mail, Paperclip, ShieldCheck } from 'lucide-react';
import { decodeExamDocument, getApiBase, getAuthHeaders, type VetPassRecord } from '../context/shared';
import { useHealth } from '../context/HealthContext';
import { usePets } from '../context/PetsContext';
import { useSession } from '../context/SessionContext';
import { useAppNavigation } from '../navigation';

type PreviewAttachment = {
  name: string;
  type: string;
  dataUrl: string;
};

type AttachmentItem = PreviewAttachment & {
  size: number;
  recordDate: string;
  key: string;
};

function bytesToLabel(size: number) {
  if (!Number.isFinite(size) || size <= 0) return 'Tamanho desconhecido';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function toUiVetPass(item: any): VetPassRecord {
  return {
    code: item.code ?? item.pass_code ?? '',
    ownerId: item.tutorId ?? item.tutor_id ?? item.ownerId ?? '',
    petId: item.petId ?? item.pet_id ?? '',
    petName: item.petName ?? item.pet_name ?? '',
    documents: Array.isArray(item.documents) ? item.documents : [],
    createdAt: item.createdAt ?? item.created_at ?? new Date().toISOString(),
    expiresAt: item.expiresAt ?? item.expires_at ?? new Date().toISOString(),
    redeemedAt: item.redeemedAt ?? item.redeemed_at ?? undefined,
  };
}

export default function ExamsScreen() {
  const { currentPet } = usePets();
  const { medicalRecords } = useHealth();
  const { user } = useSession();
  const { goToPetContext } = useAppNavigation();
  const [previewAttachment, setPreviewAttachment] = useState<PreviewAttachment | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [vetPassCode, setVetPassCode] = useState('');
  const [createdPass, setCreatedPass] = useState<VetPassRecord | null>(null);
  const [redeemedPass, setRedeemedPass] = useState<VetPassRecord | null>(null);
  const API_BASE = getApiBase();

  const attachments = useMemo(() => {
    return medicalRecords
      .filter((record) => record.petId === currentPet?.id && (record.documents?.length ?? 0) > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .flatMap((record) =>
        (record.documents ?? []).map((document, index) => {
          const meta = decodeExamDocument(document);
          const key = `${record.id}:${index}:${meta?.name ?? document.slice(0, 24)}`;
          return {
            name: meta?.name ?? 'Arquivo anexado',
            type: meta?.type ?? 'Tipo nao informado',
            size: meta?.size ?? 0,
            dataUrl: meta?.dataUrl ?? document,
            recordDate: record.date,
            key,
          } satisfies AttachmentItem;
        })
      );
  }, [currentPet?.id, medicalRecords]);

  useEffect(() => {
    setSelectedKeys(attachments.map((attachment) => attachment.key));
  }, [attachments]);

  const selectedAttachments = attachments.filter((attachment) => selectedKeys.includes(attachment.key));

  const handleGenerateVetPass = async () => {
    if (!currentPet || selectedAttachments.length === 0) return;

    const resp = await fetch(`${API_BASE}/api/vet-passes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        petId: currentPet.id,
        petName: currentPet.name,
        documents: selectedAttachments.map(({ name, type, size, dataUrl }) => ({ name, type, size, dataUrl })),
        expiresInDays: 30,
      }),
    });

    if (!resp.ok) {
      throw new Error((await resp.json()).message ?? 'Create Vet-Pass failed');
    }

    const { data } = await resp.json();
    setCreatedPass(toUiVetPass(data));
  };

  const handleRedeemVetPass = async () => {
    const code = vetPassCode.trim().toUpperCase();
    if (!code) return;

    const resp = await fetch(`${API_BASE}/api/vet-passes/${code}/redeem`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!resp.ok) {
      throw new Error((await resp.json()).message ?? 'Redeem Vet-Pass failed');
    }

    const { data } = await resp.json();
    setRedeemedPass(toUiVetPass(data));
    setVetPassCode('');
  };

  if (!currentPet && user?.userType !== 'veterinarian') {
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

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={goToPetContext}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Perfil</span>
          </button>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            Vet-Pass persistido no backend
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl text-foreground">Exames e Laudos</h1>
            <p className="text-muted-foreground">Anexos do prontuário e compartilhamento controlado via Vet-Pass.</p>
          </div>
        </div>

        {currentPet && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="bg-card rounded-3xl shadow-lg p-5 border border-border">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl text-foreground">Anexos de {currentPet.name}</h2>
                  <p className="text-sm text-muted-foreground">Selecione os laudos que deseja liberar para um veterinário.</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSelectedKeys(attachments.map((attachment) => attachment.key))} className="rounded-full border border-border px-3 py-1 text-xs text-foreground">
                    Selecionar todos
                  </button>
                  <button type="button" onClick={() => setSelectedKeys([])} className="rounded-full border border-border px-3 py-1 text-xs text-foreground">
                    Limpar
                  </button>
                </div>
              </div>

              {attachments.length === 0 ? (
                <div className="rounded-2xl border border-border bg-muted/20 p-6 text-center">
                  <p className="text-muted-foreground">Nenhum anexo de exame encontrado para este pet.</p>
                  <p className="mt-2 text-sm text-muted-foreground">Os arquivos enviados no prontuário médico aparecem aqui.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {attachments.map((attachment, index) => {
                    const checked = selectedKeys.includes(attachment.key);
                    return (
                      <div key={`${attachment.name}-${attachment.recordDate}-${index}`} className={`rounded-3xl border p-5 ${checked ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" checked={checked} onChange={() => setSelectedKeys((prev) => prev.includes(attachment.key) ? prev.filter((item) => item !== attachment.key) : [...prev, attachment.key])} className="mt-1 h-4 w-4 rounded border-border text-primary" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                <Paperclip className="w-5 h-5 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-foreground break-words">{attachment.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">{attachment.type} • {bytesToLabel(attachment.size)}</p>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setPreviewAttachment(attachment)}
                                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Visualizar
                              </button>
                              <a
                                href={attachment.dataUrl}
                                download={attachment.name}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-white hover:bg-primary/90 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                Baixar
                              </a>
                            </div>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-card rounded-3xl shadow-lg p-5 border border-border">
                <h2 className="text-xl text-foreground mb-2">Gerar Vet-Pass</h2>
                <p className="text-sm text-muted-foreground mb-4">O código libera apenas os anexos selecionados por 30 dias.</p>
                <button
                  type="button"
                  onClick={() => void handleGenerateVetPass()}
                  disabled={attachments.length === 0 || selectedKeys.length === 0}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-white disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Gerar código
                </button>
                {createdPass && (
                  <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Código gerado</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="font-mono text-sm text-foreground break-all">{createdPass.code}</p>
                      <button type="button" onClick={() => navigator.clipboard?.writeText(createdPass.code)} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground inline-flex items-center gap-2">
                        <Copy className="w-3.5 h-3.5" />
                        Copiar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {user?.userType === 'veterinarian' && (
                <div className="bg-card rounded-3xl shadow-lg p-5 border border-border">
                  <h2 className="text-xl text-foreground mb-2">Acessar Vet-Pass</h2>
                  <p className="text-sm text-muted-foreground mb-4">Digite o código recebido para abrir os laudos liberados.</p>
                  <div className="flex gap-2">
                    <input
                      value={vetPassCode}
                      onChange={(event) => setVetPassCode(event.target.value.toUpperCase())}
                      placeholder="VET-..."
                      className="flex-1 rounded-2xl border border-border bg-input px-4 py-3 uppercase tracking-wider text-foreground"
                    />
                    <button type="button" onClick={() => void handleRedeemVetPass()} className="rounded-2xl bg-primary px-4 py-3 text-white">
                      Abrir
                    </button>
                  </div>
                </div>
              )}

              {(createdPass || redeemedPass) && (
                <div className="bg-card rounded-3xl shadow-lg p-5 border border-border">
                  <h2 className="text-xl text-foreground mb-4">Vet-Pass ativo</h2>
                  {(createdPass ? [createdPass] : []).concat(redeemedPass ? [redeemedPass] : []).map((pass) => (
                    <div key={pass.code} className="rounded-2xl border border-border bg-muted/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-foreground">{pass.petName}</p>
                          <p className="text-xs text-muted-foreground">Código: {pass.code}</p>
                          <p className="text-xs text-muted-foreground">Expira em {new Date(pass.expiresAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{pass.documents.length} anexos</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {user?.userType === 'veterinarian' && !currentPet && redeemedPass && (
          <div className="bg-card rounded-3xl shadow-lg p-5 border border-border">
            <h2 className="text-xl text-foreground mb-4">Vet-Pass resgatado</h2>
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-foreground">{redeemedPass.petName}</p>
              <p className="text-sm text-muted-foreground">{redeemedPass.documents.length} anexos liberados</p>
            </div>
          </div>
        )}
      </div>

      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" onClick={() => setPreviewAttachment(null)}>
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-card border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <h3 className="text-lg text-foreground">{previewAttachment.name}</h3>
                <p className="text-xs text-muted-foreground">{previewAttachment.type}</p>
              </div>
              <button type="button" onClick={() => setPreviewAttachment(null)} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors">
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
