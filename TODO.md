# Dashboard Home Implementation Plan

## Overview
Create a unified dashboard home page that serves as the default landing page after login, providing an overview of all dashboard modules with real-time data integration.

## Tasks

### 1. Backend API Development
- [ ] Create `DashboardHomeController.php` in `backend/app/Http/Controllers/Api/`
- [ ] Implement summary statistics endpoints for:
  - Patient registrations (today/this week/this month)
  - Active doctors and nurses
  - Pending lab orders
  - Pharmacy stock alerts
  - Financial summaries (revenue, pending payments)
  - Hospital KPIs (BOR, LOS, satisfaction)
- [ ] Add API routes in `backend/routes/api.php`
- [ ] Ensure proper authentication and role-based data access

### 2. Frontend Dashboard Home Component
- [ ] Create `frontend/src/app/dashboard/home/page.tsx` - Main dashboard home page
- [ ] Create `frontend/src/components/dash/DashboardHome.tsx` - Core component
- [ ] Create `frontend/src/components/dash/hooks/useDashboardHome.ts` - Data fetching hook
- [ ] Design attractive layout with:
  - Welcome section with user info
  - Statistics cards grid (patients, revenue, etc.)
  - Quick action buttons to modules
  - Recent activities feed
  - Charts for trends (registrations, revenue)

### 3. Routing and Navigation Updates
- [ ] Update `frontend/src/app/dashboard/page.tsx` to redirect to `/dashboard/home` instead of role-specific pages
- [ ] Add "Home" menu item to sidebar navigation
- [ ] Update role-based routing to include home as default

### 4. UI/UX Enhancements
- [ ] Implement responsive grid layout for statistics cards
- [ ] Add interactive charts using existing chart components
- [ ] Ensure dark mode compatibility
- [ ] Add loading states and error handling
- [ ] Implement real-time data updates where appropriate

### 5. Integration and Testing
- [ ] Connect all summary data to real database queries
- [ ] Test with different user roles
- [ ] Ensure proper error handling for failed API calls
- [ ] Performance optimization for dashboard loading

## Dependencies
- Existing chart components (`StatCard`, `ChartBar`, `ChartLine`, etc.)
- Authentication system
- Database models and relationships
- Existing API infrastructure

## Success Criteria
- Dashboard home loads as default after login
- Displays relevant summary data for user's role
- Attractive, responsive design
- Real-time data integration
- Smooth navigation to specific modules
