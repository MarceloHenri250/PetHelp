import type { Notification } from "./types";

export const initialNotifications: Notification[] = [
  { id: "1", title: "Consulta confirmada", body: "Bolinha — 28/06 às 14:30 com Dr. Lucas Ferreira", time: "Agora mesmo", read: false, icon: "check" },
  { id: "2", title: "Vacina vencendo", body: "Giárdia do Bolinha vence em 3 dias. Agende o reforço!", time: "2h atrás", read: false, icon: "alert" },
  { id: "3", title: "Novo exame disponível", body: "Hemograma de Mingau foi carregado pela clínica.", time: "Ontem", read: true, icon: "info" },
  { id: "4", title: "Avalie sua consulta", body: "Como foi o atendimento da Dra. Mariana Costa?", time: "2 dias atrás", read: true, icon: "bell" },
];

export const mockPets = [
  { id: "1", name: "Bolinha", species: "Cão", breed: "Labrador", age: 3, weight: "28kg", photo: "photo-1543466835-00a7907e9de1" },
  { id: "2", name: "Mingau", species: "Gato", breed: "Persa", age: 5, weight: "4.2kg", photo: "photo-1514888286974-6c03e2ca1dba" },
];

export const mockConsultas = [
  { id: "1", date: "12/06/2025", vet: "Dr. Lucas Ferreira", clinic: "Clínica PetVida", diagnosis: "Dermatite alérgica", treatment: "Prednisolona 20mg por 7 dias" },
  { id: "2", date: "03/04/2025", vet: "Dra. Mariana Costa", clinic: "Hospital Pet Center", diagnosis: "Otite externa", treatment: "Otosporin 5 gotas por 10 dias" },
];

export const mockVaccines = [
  { name: "V10 (Polivalente)", date: "10/01/2025", nextDue: "10/01/2026", status: "ok" },
  { name: "Antirrábica", date: "15/03/2025", nextDue: "15/03/2026", status: "ok" },
  { name: "Giárdia", date: "20/11/2024", nextDue: "20/11/2025", status: "overdue" },
  { name: "Gripe Canina", date: "05/06/2025", nextDue: "05/06/2026", status: "ok" },
];

export const mockAgendamentos = [
  { id: "1", date: "28/06/2025", time: "14:30", vet: "Dr. Lucas Ferreira", clinic: "Clínica PetVida", pet: "Bolinha", type: "Consulta de rotina" },
  { id: "2", date: "10/07/2025", time: "09:00", vet: "Dra. Mariana Costa", clinic: "Hospital Pet Center", pet: "Mingau", type: "Vacinação" },
];

export const mockExams = [
  { id: "1", name: "Hemograma Completo", date: "12/06/2025", type: "PDF", pet: "Bolinha" },
  { id: "2", name: "Raio-X Tórax", date: "12/06/2025", type: "PNG", pet: "Bolinha" },
  { id: "3", name: "Ultrassom Abdominal", date: "03/04/2025", type: "PDF", pet: "Mingau" },
];

export const mockVetPatients = [
  { name: "Bolinha", owner: "Ana Souza", species: "Cão", breed: "Labrador", date: "28/06/2025", time: "14:30" },
  { name: "Mel", owner: "Carlos Pereira", species: "Cão", breed: "Golden", date: "28/06/2025", time: "15:30" },
  { name: "Mingau", owner: "Beatriz Lima", species: "Gato", breed: "Persa", date: "29/06/2025", time: "09:00" },
];

export const mockVets = [
  { name: "Dr. Lucas Ferreira", email: "lucas@pethelp.com", crmv: "CRMV-SP 12345", specialty: "Clínica Geral", status: "active" },
  { name: "Dra. Mariana Costa", email: "mariana@pethelp.com", crmv: "CRMV-SP 67890", specialty: "Dermatologia", status: "active" },
  { name: "Dr. Rafael Souza", email: "rafael@pethelp.com", crmv: "CRMV-RJ 11122", specialty: "Ortopedia", status: "pending" },
];
