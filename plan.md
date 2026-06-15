# ResQNet AI - MASTER DEVELOPMENT REFERENCE

Version: MVP v1.0
Purpose: Single Source of Truth for Development
Audience: Antigravity AI Development Agent
Status: Active Development

---

# PROJECT OVERVIEW

ResQNet AI is an AI-powered, offline-first disaster response and emergency coordination platform designed to connect:

- Citizens
- Volunteers
- Rescue Teams
- Authorities

through a unified emergency response ecosystem.

The platform must continue functioning during disaster scenarios where internet connectivity may be unstable or unavailable.

Primary focus:

1. Offline First Architecture
2. Maps & Location Intelligence
3. Multi-Role Coordination
4. AI-Powered Emergency Assistance
5. End-to-End Incident Lifecycle Management

---

# PROJECT OBJECTIVE

Build a complete MVP demonstrating:

Citizen Reports Emergency
↓
Location Captured
↓
AI Classifies Incident
↓
Incident Stored
↓
Authority Receives Alert
↓
Rescue Team Assigned
↓
Volunteer Assigned
↓
Status Updates
↓
Incident Resolved

The MVP must prioritize functionality, demo readiness, and architectural clarity.

---

# TECHNOLOGY STACK (LOCKED)

IMPORTANT:

DO NOT CHANGE THE TECH STACK.

DO NOT INTRODUCE ALTERNATIVE FRAMEWORKS.

DO NOT REPLACE EXISTING ARCHITECTURE.

All development must follow the stack below.

---

## Frontend

React 19

TypeScript

TanStack Start

TanStack Router

Tailwind CSS v4

ShadCN UI

Radix UI

Framer Motion

Recharts

Lucide React

---

## Maps

OpenStreetMap

Leaflet

React Leaflet

---

## Offline Architecture

PWA

Service Worker

IndexedDB

Dexie.js

---

## Backend

Node.js

Express.js

JWT Authentication

Role Based Access Control

---

## Database

MongoDB Atlas

Collections:

- Users
- Incidents
- Shelters
- Missions
- Notifications

---

## AI

Google Gemini API

Google Gemini Vision

---

## Deployment

Frontend: Vercel

Backend: Render

Database: MongoDB Atlas

---

# PROHIBITED TECHNOLOGIES

DO NOT USE:

- Next.js
- Firebase
- Supabase
- PostgreSQL
- MySQL
- Redux
- Auth0
- Clerk
- OpenAI
- Azure OpenAI
- Alternative Routing Libraries

unless explicitly approved.

---

# USER ROLES

## Citizen

Responsibilities:

- Report emergencies
- Trigger SOS
- Find shelters
- Receive AI guidance
- Track incident status

---

## Volunteer

Responsibilities:

- View available missions
- Accept assignments
- Submit updates
- Complete missions

---

## Rescue Team

Responsibilities:

- Monitor incidents
- Manage emergency response
- Update incident status
- Resolve incidents

---

## Authority

Responsibilities:

- Monitor all incidents
- Manage resources
- View analytics
- Coordinate emergency response

---

# DEVELOPMENT PHASES

---

# PHASE 0 - FOUNDATION

Goal:

Establish architecture.

Tasks:

- Setup React Project
- Configure TanStack Start
- Configure Tailwind
- Setup ShadCN
- Configure Routing
- Setup Backend
- Configure MongoDB
- Setup Environment Variables

Deliverables:

- Working Project Structure
- Routing System
- Layout System

---

# PHASE 1 - AUTHENTICATION

Goal:

Implement role-based authentication.

Features:

- Login
- Register
- Demo Login
- Protected Routes
- Session Persistence

Roles:

- Citizen
- Volunteer
- Rescue Team
- Authority

Demo Accounts:

Citizen:
citizen@resqnet.ai
demo123

Volunteer:
volunteer@resqnet.ai
demo123

Rescue:
rescue@resqnet.ai
demo123

Authority:
authority@resqnet.ai
demo123

Deliverables:

- Working Authentication
- Role-Based Routing

---

# PHASE 2 - MAPS FOUNDATION

Goal:

Build location intelligence layer.

Features:

- Interactive Map
- Geolocation Capture
- Incident Markers
- Shelter Markers
- User Location Marker

Maps Stack:

- OpenStreetMap
- Leaflet
- React Leaflet

Deliverables:

- Interactive Map
- Geolocation Support

---

# PHASE 3 - OFFLINE FIRST ARCHITECTURE

Goal:

Implement offline capabilities.

Features:

- Installable PWA
- Service Worker
- IndexedDB Storage
- Connectivity Detection
- Auto Synchronization

Offline Flow:

Internet Lost
↓
Create Incident
↓
Store In IndexedDB
↓
Add To Sync Queue
↓
Internet Restored
↓
Auto Sync To Server

Deliverables:

- Working PWA
- Offline Storage
- Sync Engine

---

# PHASE 4 - CITIZEN MODULE

Goal:

Emergency reporting workflow.

Pages:

- Dashboard
- Report Emergency
- SOS Center
- Shelter Locator
- Emergency History
- Profile

Report Emergency Fields:

- Incident Type
- Description
- Severity
- Location
- Images

Emergency Types:

- Flood
- Fire
- Earthquake
- Cyclone
- Landslide
- Medical

Deliverables:

- Complete Citizen Workflow

---

# PHASE 5 - AUTHORITY COMMAND CENTER

Goal:

Centralized monitoring.

Pages:

- Dashboard
- Incident Monitoring
- Analytics
- Resource Overview

Dashboard Metrics:

- Active Incidents
- Resolved Incidents
- Pending Incidents
- Volunteers Active
- Rescue Teams Active

Deliverables:

- Authority Dashboard
- Incident Monitoring

---

# PHASE 6 - RESCUE TEAM MODULE

Goal:

Emergency response management.

Pages:

- Dashboard
- Incident Queue
- Incident Details

Status Flow:

Pending
↓
Assigned
↓
In Progress
↓
Resolved

Actions:

- Assign Team
- Update Status
- Resolve Incident

Deliverables:

- Rescue Workflow

---

# PHASE 7 - VOLUNTEER MODULE

Goal:

Volunteer coordination.

Pages:

- Dashboard
- Available Missions
- Mission Details

Actions:

- Accept Mission
- Update Mission
- Complete Mission

Deliverables:

- Volunteer Workflow

---

# PHASE 8 - AI LAYER

Goal:

Add intelligence to emergency management.

Feature 1:

AI Emergency Assistant

Capabilities:

- Flood Guidance
- Fire Safety
- Earthquake Response
- Medical Advice
- Shelter Assistance

---

Feature 2:

AI Incident Classification

Input:

"Water entered my house."

Output:

Type: Flood
Severity: High
Priority: P2

---

Feature 3:

AI Incident Summary

Convert citizen reports into structured summaries.

---

Feature 4:

AI Damage Assessment

Input:

Image Upload

Output:

Detected Damage
Severity Level
Recommendations

Deliverables:

- Gemini Integration
- AI Assistant
- Classification
- Summary Generation
- Image Analysis

---

# PHASE 9 - SYSTEM INTEGRATION

Goal:

Connect all user roles.

Workflow:

Citizen Creates Incident
↓
AI Classifies Incident
↓
Authority Receives Alert
↓
Rescue Team Assigned
↓
Volunteer Assigned
↓
Status Updated
↓
Incident Resolved

Deliverables:

- Complete End-To-End Workflow

---

# PHASE 10 - UI POLISH

Goal:

Prepare project for demo and judging.

Requirements:

- Apple Inspired Design
- Glassmorphism
- Smooth Animations
- Responsive Layout
- Loading States
- Skeleton Screens
- Notifications
- Toast Messages
- Dark Mode

Deliverables:

- Demo Ready Application

---

# NON-MVP FEATURES

DO NOT BUILD DURING MVP

- Disaster Prediction
- Drone Integration
- Satellite Monitoring
- IoT Sensors
- SMS Gateway
- AI Resource Allocation
- AI Duplicate Detection
- Dynamic Route Optimization
- Mesh Networking
- National Disaster Network

These belong to Future Scope only.

---

# MVP SUCCESS CRITERIA

The MVP is complete when:

✓ Authentication Works

✓ Maps Work

✓ PWA Installs Successfully

✓ Offline Reporting Works

✓ Sync Engine Works

✓ Citizen Workflow Complete

✓ Authority Workflow Complete

✓ Rescue Workflow Complete

✓ Volunteer Workflow Complete

✓ AI Assistant Works

✓ AI Classification Works

✓ AI Image Analysis Works

✓ End-To-End Workflow Functions

---

# PRODUCT POSITIONING

ResQNet AI is an offline-first, AI-powered disaster response platform that enables citizens, volunteers, rescue teams, and authorities to coordinate effectively during emergencies, even when communication infrastructure is disrupted.

Tagline:

Turning Chaos Into Coordinated Action.