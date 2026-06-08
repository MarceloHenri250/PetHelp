import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserType = 'owner' | 'clinic';

interface Pet {
  id: string;
  name: string;
  species: string;
  age: string;
  breed?: string;
  weight?: string;
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
  addPet: (pet: Omit<Pet, 'id'>) => Promise<void>;
  updatePet: (id: string, pet: Partial<Pet>) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
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

  const API_BASE = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3333';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchPets = async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/pets`, { headers: { ...getAuthHeaders() } });
      if (!resp.ok) return;
      const data = await resp.json();
      const list: Pet[] = data.data ?? [];
      setPets(list);
      if (list.length > 0) setCurrentPet(list[0]);
    } catch (err) {
      console.error('fetchPets error', err);
    }
  };

  const login = async (email: string, password: string, userType: UserType) => {
    const resp = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!resp.ok) {
      throw new Error((await resp.json()).message ?? 'Login failed');
    }

    const data = await resp.json();
    const { id, token } = data;
    localStorage.setItem('token', token);

    const profileResp = await fetch(`${API_BASE}/api/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (profileResp.ok) {
      const { data: profile } = await profileResp.json();
      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        userType: profile.user_type,
        clinicName: profile.clinic_name ?? undefined,
        address: profile.address ?? undefined,
        phone: profile.phone ?? undefined,
        connectionCode: profile.connection_code ?? undefined,
      });
      await fetchPets();
    } else {
      setUser({ id, name: '', email, userType });
    }
  };

  const register = async (name: string, email: string, password: string, userType: UserType, clinicName?: string) => {
    const resp = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, userType, clinicName }),
    });

    if (!resp.ok) {
      throw new Error((await resp.json()).message ?? 'Register failed');
    }

    const { id, token } = await resp.json();
    localStorage.setItem('token', token);

    const profileResp = await fetch(`${API_BASE}/api/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (profileResp.ok) {
      const { data: profile } = await profileResp.json();
      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        userType: profile.user_type,
        clinicName: profile.clinic_name ?? undefined,
        address: profile.address ?? undefined,
        phone: profile.phone ?? undefined,
        connectionCode: profile.connection_code ?? undefined,
      });
      await fetchPets();
    } else {
      setUser({ id, name, email, userType });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setCurrentPet(null);
    setPets([]);
    setMedicalRecords([]);
    setVaccines([]);
    setAppointments([]);
    setNotifications([]);
  };

  const addPet = (pet: Omit<Pet, 'id'>) => {
    return (async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/pets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(pet),
        });
        if (!resp.ok) throw new Error((await resp.json()).message ?? 'Create pet failed');
        const { data } = await resp.json();
        const newPet: Pet = data;
        setPets((prev: Pet[]) => [...prev, newPet]);
        if (!currentPet) setCurrentPet(newPet);
      } catch (err) {
        console.error('addPet error', err);
        throw err;
      }
    })();
  };

  const updatePet = (id: string, petUpdate: Partial<Pet>) => {
    return (async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/pets/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(petUpdate),
        });
        if (!resp.ok) throw new Error((await resp.json()).message ?? 'Update failed');
        const { data } = await resp.json();
        setPets((prev: Pet[]) => prev.map((petItem: Pet) => petItem.id === id ? { ...petItem, ...data } : petItem));
        if (currentPet?.id === id) setCurrentPet((prev: Pet | null) => prev ? { ...prev, ...data } : null);
      } catch (err) {
        console.error('updatePet error', err);
        throw err;
      }
    })();
  };

  const deletePet = (id: string) => {
    return (async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/pets/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        if (!resp.ok && resp.status !== 204) throw new Error((await resp.json()).message ?? 'Delete failed');
        setPets((prev: Pet[]) => {
          const nextPets = prev.filter((petItem: Pet) => petItem.id !== id);
          if (currentPet?.id === id) {
            setCurrentPet(nextPets.length > 0 ? nextPets[0] : null);
          }
          return nextPets;
        });
      } catch (err) {
        console.error('deletePet error', err);
        throw err;
      }
    })();
  };

  const addMedicalRecord = (record: Omit<MedicalRecord, 'id'>) => {
    const newRecord: MedicalRecord = {
      ...record,
      id: Date.now().toString(),
    };
    setMedicalRecords((prev: MedicalRecord[]) => [newRecord, ...prev]);
  };

  const addVaccine = (vaccine: Omit<Vaccine, 'id'>) => {
    const newVaccine: Vaccine = {
      ...vaccine,
      id: Date.now().toString(),
    };
    setVaccines((prev: Vaccine[]) => [...prev, newVaccine]);
  };

  const updateVaccine = (id: string, vaccineUpdate: Partial<Vaccine>) => {
    setVaccines((prev: Vaccine[]) => prev.map((vaccineItem: Vaccine) => vaccineItem.id === id ? { ...vaccineItem, ...vaccineUpdate } : vaccineItem));
  };

  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
    };
    setAppointments((prev: Appointment[]) => [...prev, newAppointment]);
  };

  const updateAppointment = (id: string, appointmentUpdate: Partial<Appointment>) => {
    setAppointments((prev: Appointment[]) => prev.map((appointmentItem: Appointment) => appointmentItem.id === id ? { ...appointmentItem, ...appointmentUpdate } : appointmentItem));
  };

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
    };
    setNotifications((prev: Notification[]) => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev: Notification[]) => prev.map((notificationItem: Notification) => notificationItem.id === id ? { ...notificationItem, read: true } : notificationItem));
  };

  const linkPetToClinic = async (petId: string, clinicCode: string) => {
    await updatePet(petId, { linkedClinicId: clinicCode });
    addNotification({
      userId: user?.id || '',
      type: 'connection',
      title: 'Clinic Linked Successfully',
      message: `Your pet has been linked to the clinic with code ${clinicCode}`,
      date: new Date().toISOString().split('T')[0],
      petId,
      read: false,
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
        deletePet,
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
