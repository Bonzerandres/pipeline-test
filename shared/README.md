# On-Demand Laundry & Delivery App

A multi-sided marketplace platform that connects customers, drivers, laundromats, independent washers, and dry cleaners for seamless laundry logistics.

## 🚀 Features

### Customers
- User registration and authentication
- Request laundry pickup with real-time tracking
- Choose service providers (laundromat, independent washer, dry cleaner)
- Secure payment processing
- Service rating and reviews

### Drivers
- Driver onboarding and verification
- Accept/decline delivery requests
- Real-time navigation integration
- Status updates and earnings dashboard

### Service Providers
- **Laundromats**: Order management dashboard, status updates, revenue reports
- **Independent Washers**: Verification system, availability toggle, order management
- **Dry Cleaners**: Specialized services, premium pricing, dispatch integration

## 🏗️ Architecture

### Microservices
1. **User Service** - Authentication, roles, profiles
2. **Order Service** - Order management and tracking
3. **Payment Service** - Payment processing and billing
4. **Notification Service** - Real-time notifications
5. **Location Service** - Geolocation and routing
6. **Dispatch Service** - Driver assignment and routing

### Tech Stack
- **Frontend**: React Native (iOS/Android)
- **Backend**: Node.js with Express
- **Database**: PostgreSQL + Redis
- **Infrastructure**: Docker + Kubernetes
- **Cloud**: AWS (EC2, S3, RDS, EKS)
- **APIs**: Stripe, Twilio, Google Maps
- **Auth**: Firebase Auth

## 📁 Project Structure

```
├── frontend/                 # React Native mobile app
├── backend/                  # Microservices
│   ├── user-service/
│   ├── order-service/
│   ├── payment-service/
│   ├── notification-service/
│   ├── location-service/
│   └── dispatch-service/
├── infrastructure/           # Docker, K8s, AWS configs
├── shared/                   # Shared utilities and types
└── docs/                     # Documentation
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL
- Redis
- React Native development environment

### Quick Start
1. Clone the repository
2. Run `docker-compose up` for infrastructure
3. Install dependencies: `npm install` in each service
4. Start development servers
5. Run the React Native app

## 🔧 Development

### Backend Services
Each microservice can be developed independently:
```bash
cd backend/user-service
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npx react-native run-android  # or run-ios
```

## 📊 API Documentation
- Swagger docs available at `/api-docs` for each service
- Postman collection included in `/docs`

## 🚀 Deployment
- Kubernetes manifests in `/infrastructure/k8s`
- AWS CloudFormation templates in `/infrastructure/aws`
- CI/CD pipelines configured for automated deployment

## 📝 License
MIT License - see LICENSE file for details
