import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserType = 'owner' | 'clinic';

interface Pet {
  id: string;
  name: string;
  age: string;
  breed: string;
  weight: string;
  photo: string;
  ownerId: string;
  allergies?: string[];
  conditions?: string[];
  linkedClinicId?: string;
}

interface MedicalRecord {
  id: string;
  petId: string;
  date: string;
  description: string;
  clinicId?: string;
  clinicName?: string;
  veterinarianName?: string;
  documents?: string[];
}

interface Vaccine {
  id: string;
  petId: string;
  name: string;
  appliedDate: string;
  nextDose: string;
  status: 'up-to-date' | 'late';
  clinicId?: string;
  clinicName?: string;
}

interface Appointment {
  id: string;
  petId: string;
  petName: string;
  clinicId: string;
  clinicName: string;
  date: string;
  time: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  ownerId: string;
}

interface Notification {
  id: string;
  userId: string;
  type: 'vaccine' | 'appointment' | 'connection';
  title: string;
  message: string;
  date: string;
  read: boolean;
  petId?: string;
  appointmentId?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  clinicName?: string;
  address?: string;
  phone?: string;
  connectionCode?: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  currentPet: Pet | null;
  setCurrentPet: (pet: Pet | null) => void;
  pets: Pet[];
  addPet: (pet: Omit<Pet, 'id'>) => void;
  updatePet: (id: string, pet: Partial<Pet>) => void;
  medicalRecords: MedicalRecord[];
  addMedicalRecord: (record: Omit<MedicalRecord, 'id'>) => void;
  vaccines: Vaccine[];
  addVaccine: (vaccine: Omit<Vaccine, 'id'>) => void;
  updateVaccine: (id: string, vaccine: Partial<Vaccine>) => void;
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markNotificationAsRead: (id: string) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: UserType) => Promise<void>;
  register: (name: string, email: string, password: string, userType: UserType, clinicName?: string) => Promise<void>;
  logout: () => void;
  linkPetToClinic: (petId: string, clinicCode: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const login = async (email: string, password: string, userType: UserType) => {
    const userId = Date.now().toString();
    const mockUser: User = {
      id: userId,
      name: userType === 'owner' ? 'John Doe' : 'Pet Care Clinic',
      email,
      userType,
      clinicName: userType === 'clinic' ? 'Pet Care Clinic' : undefined,
      address: userType === 'clinic' ? '123 Main St, City' : undefined,
      phone: userType === 'clinic' ? '(555) 123-4567' : undefined,
      connectionCode: userType === 'clinic' ? 'CLINIC' + userId.slice(-4) : undefined,
    };
    setUser(mockUser);

    if (userType === 'owner') {
      const mockPet: Pet = {
        id: '1',
        name: 'Max',
        age: '3 years',
        breed: 'Golden Retriever',
        weight: '30 kg',
        photo: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400',
        ownerId: userId,
        allergies: ['Chicken', 'Pollen'],
        conditions: ['Hip dysplasia'],
        linkedClinicId: 'clinic1',
      };
      setPets([mockPet]);
      setCurrentPet(mockPet);

      setMedicalRecords([
        {
          id: '1',
          petId: '1',
          date: '2026-02-15',
          description: 'Annual checkup - All vitals normal. Weight: 30kg',
          clinicId: 'clinic1',
          clinicName: 'Pet Care Clinic',
          veterinarianName: 'Dr. Smith',
        },
        {
          id: '2',
          petId: '1',
          date: '2026-01-10',
          description: 'Skin allergy treatment - Prescribed antihistamine',
          clinicId: 'clinic1',
          clinicName: 'Pet Care Clinic',
          veterinarianName: 'Dr. Johnson',
        },
      ]);

      setVaccines([
        {
          id: '1',
          petId: '1',
          name: 'Rabies',
          appliedDate: '2025-03-15',
          nextDose: '2026-03-15',
          status: 'late',
          clinicId: 'clinic1',
          clinicName: 'Pet Care Clinic',
        },
        {
          id: '2',
          petId: '1',
          name: 'DHPP (Distemper)',
          appliedDate: '2025-02-20',
          nextDose: '2026-02-20',
          status: 'late',
          clinicId: 'clinic1',
          clinicName: 'Pet Care Clinic',
        },
        {
          id: '3',
          petId: '1',
          name: 'Bordetella',
          appliedDate: '2025-06-10',
          nextDose: '2026-06-10',
          status: 'up-to-date',
          clinicId: 'clinic1',
          clinicName: 'Pet Care Clinic',
        },
      ]);

      setAppointments([
        {
          id: '1',
          petId: '1',
          petName: 'Max',
          clinicId: 'clinic1',
          clinicName: 'Pet Care Clinic',
          date: '2026-05-10',
          time: '10:00 AM',
          reason: 'Annual checkup',
          status: 'scheduled',
          ownerId: userId,
        },
        {
          id: '2',
          petId: '1',
          petName: 'Max',
          clinicId: 'clinic1',
          clinicName: 'Pet Care Clinic',
          date: '2026-06-15',
          time: '2:30 PM',
          reason: 'Vaccination booster',
          status: 'scheduled',
          ownerId: userId,
        },
      ]);

      setNotifications([
        {
          id: '1',
          userId,
          type: 'vaccine',
          title: 'Vaccine Overdue',
          message: 'Rabies vaccine for Max is overdue. Please schedule an appointment.',
          date: '2026-04-20',
          read: false,
          petId: '1',
        },
        {
          id: '2',
          userId,
          type: 'appointment',
          title: 'Upcoming Appointment',
          message: 'Max has an appointment on May 10 at 10:00 AM',
          date: '2026-04-25',
          read: false,
          petId: '1',
          appointmentId: '1',
        },
      ]);
    } else {
      const mockClinicPets: Pet[] = [
        {
          id: 'p1',
          name: 'Max',
          age: '3 years',
          breed: 'Golden Retriever',
          weight: '30 kg',
          photo: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400',
          ownerId: 'owner1',
          linkedClinicId: userId,
        },
        {
          id: 'p2',
          name: 'Bella',
          age: '2 years',
          breed: 'Labrador',
          weight: '25 kg',
          photo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
          ownerId: 'owner2',
          linkedClinicId: userId,
        },
        {
          id: 'p3',
          name: 'Charlie',
          age: '5 years',
          breed: 'German Shepherd',
          weight: '35 kg',
          photo: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400',
          ownerId: 'owner3',
          linkedClinicId: userId,
        },
      ];
      setPets(mockClinicPets);

      setAppointments([
        {
          id: 'a1',
          petId: 'p1',
          petName: 'Max',
          clinicId: userId,
          clinicName: 'Pet Care Clinic',
          date: '2026-04-28',
          time: '9:00 AM',
          reason: 'Routine checkup',
          status: 'scheduled',
          ownerId: 'owner1',
        },
        {
          id: 'a2',
          petId: 'p2',
          petName: 'Bella',
          clinicId: userId,
          clinicName: 'Pet Care Clinic',
          date: '2026-04-28',
          time: '11:00 AM',
          reason: 'Vaccination',
          status: 'scheduled',
          ownerId: 'owner2',
        },
      ]);
    }
  };

  const register = async (name: string, email: string, password: string, userType: UserType, clinicName?: string) => {
    const userId = Date.now().toString();
    const mockUser: User = {
      id: userId,
      name,
      email,
      userType,
      clinicName: userType === 'clinic' ? clinicName : undefined,
      connectionCode: userType === 'clinic' ? 'CLINIC' + userId.slice(-4) : undefined,
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
    setCurrentPet(null);
    setPets([]);
    setMedicalRecords([]);
    setVaccines([]);
    setAppointments([]);
    setNotifications([]);
  };

  const addPet = (pet: Omit<Pet, 'id'>) => {
    const newPet: Pet = {
      ...pet,
      id: Date.now().toString(),
    };
    setPets(prev => [...prev, newPet]);
    if (!currentPet) {
      setCurrentPet(newPet);
    }
  };

  const updatePet = (id: string, petUpdate: Partial<Pet>) => {
    setPets(prev => prev.map(p => p.id === id ? { ...p, ...petUpdate } : p));
    if (currentPet?.id === id) {
      setCurrentPet(prev => prev ? { ...prev, ...petUpdate } : null);
    }
  };

  const addMedicalRecord = (record: Omit<MedicalRecord, 'id'>) => {
    const newRecord: MedicalRecord = {
      ...record,
      id: Date.now().toString(),
    };
    setMedicalRecords(prev => [newRecord, ...prev]);
  };

  const addVaccine = (vaccine: Omit<Vaccine, 'id'>) => {
    const newVaccine: Vaccine = {
      ...vaccine,
      id: Date.now().toString(),
    };
    setVaccines(prev => [...prev, newVaccine]);
  };

  const updateVaccine = (id: string, vaccineUpdate: Partial<Vaccine>) => {
    setVaccines(prev => prev.map(v => v.id === id ? { ...v, ...vaccineUpdate } : v));
  };

  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
    };
    setAppointments(prev => [...prev, newAppointment]);
  };

  const updateAppointment = (id: string, appointmentUpdate: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...appointmentUpdate } : a));
  };

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const linkPetToClinic = async (petId: string, clinicCode: string) => {
    updatePet(petId, { linkedClinicId: clinicCode });
    addNotification({
      userId: user?.id || '',
      type: 'connection',
      title: 'Clinic Linked Successfully',
      message: `Your pet has been linked to the clinic with code ${clinicCode}`,
      date: new Date().toISOString().split('T')[0],
      petId,
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        currentPet,
        setCurrentPet,
        pets,
        addPet,
        updatePet,
        medicalRecords,
        addMedicalRecord,
        vaccines,
        addVaccine,
        updateVaccine,
        appointments,
        addAppointment,
        updateAppointment,
        notifications,
        addNotification,
        markNotificationAsRead,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        linkPetToClinic,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
