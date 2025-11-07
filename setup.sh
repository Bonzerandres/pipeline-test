#!/bin/bash

# Laundry App Setup Script
# This script sets up the entire laundry delivery application

set -e

echo " Setting up Laundry Delivery App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are installed"
}

# Check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed. Some development features may not work."
    else
        NODE_VERSION=$(node --version)
        print_success "Node.js $NODE_VERSION is installed"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating project directories..."
    
    mkdir -p backend/user-service/logs
    mkdir -p backend/order-service/logs
    mkdir -p backend/payment-service/logs
    mkdir -p backend/notification-service/logs
    mkdir -p backend/location-service/logs
    mkdir -p backend/dispatch-service/logs
    mkdir -p backend/api-gateway/logs
    mkdir -p frontend
    mkdir -p infrastructure/k8s
    mkdir -p infrastructure/aws
    mkdir -p docs
    
    print_success "Directories created"
}

# Install shared package dependencies
install_shared_deps() {
    print_status "Installing shared package dependencies..."
    
    cd shared
    npm install
    npm run build
    cd ..
    
    print_success "Shared package dependencies installed"
}

# Install User Service dependencies
install_user_service_deps() {
    print_status "Installing User Service dependencies..."
    
    cd backend/user-service
    npm install
    cd ../..
    
    print_success "User Service dependencies installed"
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Copy example env file for user service
    if [ ! -f backend/user-service/.env ]; then
        cp backend/user-service/env.example backend/user-service/.env
        print_success "Created .env file for User Service"
    else
        print_warning "User Service .env file already exists"
    fi
    
    print_success "Environment files created"
}

# Start Docker services
start_services() {
    print_status "Starting Docker services..."
    
    # Start only the infrastructure services first
    docker-compose up -d postgres redis
    
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Start the user service
    docker-compose up -d user-service
    
    print_success "Core services started"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for database to be fully ready
    sleep 5
    
    # The schema.sql file will be automatically executed by PostgreSQL container
    print_success "Database migrations completed"
}

# Display setup information
display_info() {
    echo ""
    echo " Laundry App Setup Complete!"
    echo ""
    echo " Service Information:"
    echo "  • PostgreSQL Database: localhost:5432"
    echo "  • Redis Cache: localhost:6379"
    echo "  • User Service: localhost:3001"
    echo "  • API Documentation: http://localhost:3001/api-docs"
    echo ""
    echo " Next Steps:"
    echo "  1. Configure your environment variables in backend/user-service/.env"
    echo "  2. Set up your email service (SMTP) for verification emails"
    echo "  3. Configure Stripe for payment processing"
    echo "  4. Set up Google Maps API for location services"
    echo "  5. Configure Twilio for SMS notifications"
    echo ""
    echo " To start all services:"
    echo "  docker-compose up -d"
    echo ""
    echo " To stop all services:"
    echo "  docker-compose down"
    echo ""
    echo " To view logs:"
    echo "  docker-compose logs -f user-service"
    echo ""
    echo " Health Check:"
    echo "  curl http://localhost:3001/health"
    echo ""
}

# Main setup function
main() {
    print_status "Starting Laundry App setup..."
    
    check_docker
    check_nodejs
    create_directories
    install_shared_deps
    install_user_service_deps
    create_env_files
    start_services
    run_migrations
    display_info
    
    print_success "Setup completed successfully!"
}

# Run main function
main "$@"
