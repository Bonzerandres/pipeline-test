// Shared types for the laundry delivery app

export enum UserRole {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
  LAUNDROMAT = 'laundromat',
  INDEPENDENT_WASHER = 'independent_washer',
  DRY_CLEANER = 'dry_cleaner',
  ADMIN = 'admin'
}

export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  PICKED_UP = 'picked_up',
  IN_PROGRESS = 'in_progress',
  READY = 'ready',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum ServiceType {
  LAUNDROMAT = 'laundromat',
  INDEPENDENT_WASHER = 'independent_washer',
  DRY_CLEANER = 'dry_cleaner'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum DriverStatus {
  OFFLINE = 'offline',
  ONLINE = 'online',
  BUSY = 'busy',
  ON_TRIP = 'on_trip'
}

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  isActive: boolean;
}

export interface Customer extends User {
  role: UserRole.CUSTOMER;
  defaultAddress?: Address;
  paymentMethods: PaymentMethod[];
  preferences: CustomerPreferences;
}

export interface Driver extends User {
  role: UserRole.DRIVER;
  vehicle: Vehicle;
  currentLocation: Location;
  status: DriverStatus;
  rating: number;
  totalTrips: number;
  earnings: DriverEarnings;
  documents: DriverDocuments;
  isAvailable: boolean;
}

export interface ServiceProvider extends User {
  role: UserRole.LAUNDROMAT | UserRole.INDEPENDENT_WASHER | UserRole.DRY_CLEANER;
  businessName: string;
  businessAddress: Address;
  services: Service[];
  operatingHours: OperatingHours;
  rating: number;
  totalOrders: number;
  earnings: ProviderEarnings;
  isAvailable: boolean;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  insuranceInfo: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  isAvailable: boolean;
}

export interface Order {
  id: string;
  customerId: string;
  driverId?: string;
  providerId: string;
  serviceType: ServiceType;
  services: OrderService[];
  pickupAddress: Address;
  deliveryAddress: Address;
  status: OrderStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  estimatedPickupTime: Date;
  estimatedDeliveryTime: Date;
  actualPickupTime?: Date;
  actualDeliveryTime?: Date;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderService {
  serviceId: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'digital_wallet';
  last4?: string;
  brand?: string;
  isDefault: boolean;
  stripePaymentMethodId: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerPreferences {
  preferredServiceType?: ServiceType;
  preferredProviders?: string[];
  notificationSettings: NotificationSettings;
  language: string;
  currency: string;
}

export interface DriverEarnings {
  totalEarnings: number;
  thisWeek: number;
  thisMonth: number;
  pendingPayout: number;
  completedTrips: number;
}

export interface ProviderEarnings {
  totalEarnings: number;
  thisWeek: number;
  thisMonth: number;
  pendingPayout: number;
  completedOrders: number;
}

export interface DriverDocuments {
  driverLicense: string;
  vehicleRegistration: string;
  insurance: string;
  backgroundCheck: string;
  isVerified: boolean;
}

export interface OperatingHours {
  monday: TimeRange;
  tuesday: TimeRange;
  wednesday: TimeRange;
  thursday: TimeRange;
  friday: TimeRange;
  saturday: TimeRange;
  sunday: TimeRange;
}

export interface TimeRange {
  open: string; // HH:MM format
  close: string; // HH:MM format
  isOpen: boolean;
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotionalOffers: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order_update' | 'payment' | 'promotional' | 'system';
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

export interface Trip {
  id: string;
  driverId: string;
  orderId: string;
  startLocation: Location;
  endLocation: Location;
  startTime: Date;
  endTime?: Date;
  distance: number; // in kilometers
  duration: number; // in minutes
  earnings: number;
  status: 'active' | 'completed' | 'cancelled';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

