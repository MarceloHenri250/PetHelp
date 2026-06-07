import { createBrowserRouter, Navigate } from 'react-router';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OwnerDashboardScreen from './screens/OwnerDashboardScreen';
import ClinicDashboardScreen from './screens/ClinicDashboardScreen';
import PetRegistrationScreen from './screens/PetRegistrationScreen';
import PetProfileScreen from './screens/PetProfileScreen';
import MedicalHistoryScreen from './screens/MedicalHistoryScreen';
import VaccinationScreen from './screens/VaccinationScreen';
import AppointmentsScreen from './screens/AppointmentsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ConnectionScreen from './screens/ConnectionScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LoginScreen,
  },
  {
    path: '/register',
    Component: RegisterScreen,
  },
  {
    path: '/pet-registration',
    Component: PetRegistrationScreen,
  },
  {
    path: '/owner-dashboard',
    Component: OwnerDashboardScreen,
  },
  {
    path: '/clinic-dashboard',
    Component: ClinicDashboardScreen,
  },
  {
    path: '/pet-profile',
    Component: PetProfileScreen,
  },
  {
    path: '/medical-history',
    Component: MedicalHistoryScreen,
  },
  {
    path: '/vaccines',
    Component: VaccinationScreen,
  },
  {
    path: '/appointments',
    Component: AppointmentsScreen,
  },
  {
    path: '/notifications',
    Component: NotificationsScreen,
  },
  {
    path: '/connection',
    Component: ConnectionScreen,
  },
  {
    path: '/dashboard',
    Component: () => <Navigate to="/owner-dashboard" replace />,
  },
  {
    path: '*',
    Component: () => <Navigate to="/" replace />,
  },
]);
