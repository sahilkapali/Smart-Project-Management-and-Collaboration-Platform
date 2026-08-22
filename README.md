# 🚀 Smart Project Management and Collaboration Platform

> A modern, full-stack project management and team collaboration platform designed to help teams plan projects, manage tasks, collaborate in real time, track repositories and issues, conduct meetings, and leverage AI-powered project insights.

---

## 📌 Overview

**Smart Project Management and Collaboration Platform** is a full-stack web application built to centralize project planning, team collaboration, task management, issue tracking, repository management, meetings, notifications, reporting, and AI-assisted project intelligence in a single platform.

The application provides separate frontend and backend services with a RESTful API architecture, MongoDB persistence, JWT-based authentication, real-time communication through Socket.IO, cloud-based media storage, and Google Gemini-powered AI capabilities.

---

## ✨ Key Features

### 🔐 Authentication & User Management

* User registration and login
* JWT-based authentication
* Secure password hashing
* Forgot password functionality
* OTP-based password reset
* Change password
* User profile management
* Profile image upload
* Role-based access control
* Admin and project-level permissions

---

### 📊 Project Management

* Create and manage projects
* Project descriptions and status management
* Project start and due dates
* Assign teams to projects
* Project-level activities
* Project dashboard metrics
* Project progress tracking
* Project-specific AI insights

---

### 👥 Team Collaboration

* Create and manage teams
* Add team members
* Manage project team relationships
* Role-based project access
* Team member assignment
* Collaborative project workflows

---

### ✅ Task Management

* Create, update, and delete tasks
* Assign tasks to team members
* Task status management
* Task priorities:

  * Low
  * Medium
  * High
  * Critical
* Due dates
* Task comments
* Project-based task filtering
* Kanban-style task management
* AI-powered task prioritization

The backend validates AI-generated task priorities against the supported priority levels and associates each recommendation with a task and reason.

---

### 🤖 AI-Powered Project Intelligence

The platform integrates **Google Gemini AI** to provide intelligent project-management assistance.

Current AI capabilities include:

* Project insights
* AI task prioritization
* Project-level task prioritization
* Meeting summaries
* Meeting action-item extraction
* Project AI output history
* Task AI output history
* Meeting AI output history

The frontend includes a dedicated AI page that allows users to select a project and generate project insights.

---

### 📁 Repository Management

* Create and manage project repositories
* Repository versions
* Repository files
* Create, update, and delete repository files
* Repository issue management
* Repository statistics
* Repository-based development workflow

The frontend communicates with dedicated repository and repository-file services for retrieving repository files, versions, issues, and statistics.

---

### 🐛 Issue Tracking

* Create issues
* Issue descriptions
* Issue priorities
* Assign issues to users
* View issues
* View individual issue details
* Update issues
* Delete issues
* Issue comments
* Permission-based issue modification

---

### 💬 Comments & Collaboration

* Add comments to issues
* Retrieve comments
* Retrieve comments by issue
* Update comments
* Delete comments
* User-based collaboration around project issues and tasks

---

### 📅 Meeting Management

* Create and manage project meetings
* Meeting descriptions
* Meeting dates and times
* Meeting participants
* External meeting links
* Meeting notes
* AI-generated meeting summaries
* AI-generated action items

Meeting details support participants, meeting links, notes, AI summaries, and action items.

---

### 🔔 Notifications & Real-Time Communication

The platform uses **Socket.IO** for real-time communication.

Features include:

* Real-time socket connections
* User-specific socket rooms
* Connection/disconnection handling
* Real-time notification infrastructure
* WebSocket and polling transports

The Socket.IO server creates personal rooms using authenticated user IDs and supports both WebSocket and polling transports.

---

### 📈 Dashboard & Reporting

* Dashboard metrics
* Project statistics
* Activity tracking
* Project reports
* User activities
* Project activities
* System activity history

---

### ☁️ Cloud File & Image Storage

The backend integrates **Cloudinary** for cloud-based media storage.

Currently used for:

* User profile images
* Secure cloud image URLs
* Cloudinary public IDs
* Profile media management

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────┐
│                  Frontend                   │
│                                             │
│ React + TypeScript + Vite                   │
│ Material UI                                 │
│ React Router                                │
│ Axios                                       │
│ Socket.IO Client                            │
└──────────────────────┬──────────────────────┘
                       │
                       │ REST API / WebSocket
                       ▼
┌─────────────────────────────────────────────┐
│                  Backend                    │
│                                             │
│ Node.js + Express + TypeScript              │
│ JWT Authentication                          │
│ REST API                                    │
│ Socket.IO                                   │
│ Gemini AI                                   │
└───────────────┬───────────────┬─────────────┘
                │               │
                ▼               ▼
       ┌────────────────┐   ┌───────────────┐
       │    MongoDB     │   │  Cloudinary   │
       │                │   │               │
       │ Application    │   │ Image / Media │
       │ Data           │   │ Storage       │
       └────────────────┘   └───────────────┘

                       │
                       ▼
                ┌───────────────┐
                │ Google Gemini │
                │      AI       │
                └───────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

| Technology              | Purpose                          |
| ----------------------- | -------------------------------- |
| React 19                | User interface                   |
| TypeScript              | Type-safe development            |
| Vite                    | Development and production build |
| Material UI             | UI components                    |
| React Router            | Application routing              |
| Axios                   | HTTP/API communication           |
| React Hook Form         | Form management                  |
| React Hot Toast         | Notifications                    |
| Socket.IO Client        | Real-time communication          |
| React Icons / MUI Icons | Interface icons                  |

The frontend uses React 19, TypeScript, Vite, Material UI, Axios, React Router, React Hook Form, and Socket.IO Client.

### Backend

| Technology              | Purpose                       |
| ----------------------- | ----------------------------- |
| Node.js                 | Runtime environment           |
| Express 5               | REST API framework            |
| TypeScript              | Type-safe backend development |
| MongoDB                 | Database                      |
| Mongoose                | MongoDB ODM                   |
| JWT                     | Authentication                |
| bcryptjs                | Password hashing              |
| Socket.IO               | Real-time communication       |
| Google Gemini           | AI capabilities               |
| Cloudinary              | Cloud media storage           |
| Nodemailer              | Email functionality           |
| Multer                  | File upload handling          |
| Helmet                  | Security middleware           |
| CORS                    | Cross-origin configuration    |
| Zod / Express Validator | Validation                    |

---

## 📂 Project Structure

```text
Smart-Project-Management-and-Collaboration-Platform/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── main.tsx
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vercel.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── server.ts
│   │
│   ├── uploads/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── README.md
└── .gitignore
```

The backend follows a controller/service/model/route-oriented structure and registers dedicated routes for authentication, users, projects, teams, tasks, repositories, issues, comments, meetings, AI, notifications, dashboard, reports, and activities.

---

# 🚀 Getting Started

## 📋 Prerequisites

Make sure you have the following installed:

* Node.js 18+
* npm
* MongoDB
* Git
* A Google Gemini API key
* A Cloudinary account
* An email account/application password for email functionality

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

cd Smart-Project-Management-and-Collaboration-Platform
```

Replace `YOUR_USERNAME/YOUR_REPOSITORY` with your actual GitHub repository.

---

# ⚙️ Backend Setup

## 2️⃣ Navigate to Backend

```bash
cd backend
```

## 3️⃣ Install Dependencies

```bash
npm install
```

## 4️⃣ Configure Environment Variables

Create a `.env` file inside the `backend` directory:

```env
NODE_ENV=development

PORT=5000

# MongoDB
DB_URI=your_mongodb_connection_string
DB_NAME=your_database_name

# JWT
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Email
MAIL_USER=your_email@example.com
MAIL_PASSWORD=your_email_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend
FRONTEND_URL=http://localhost:5173
```

The repository provides a backend `.env.example` containing the MongoDB, JWT, Gemini, email, and Cloudinary configuration variables.

> ⚠️ **Never commit your ****`.env`**** file or API keys to GitHub.**

---

## 5️⃣ Start the Backend in Development

```bash
npm run dev
```

The backend development script uses TypeScript with `tsx` watch mode.

The API will normally be available at:

```text
http://localhost:5000
```

---

# 💻 Frontend Setup

## 6️⃣ Open a New Terminal

From the project root:

```bash
cd frontend
```

## 7️⃣ Install Dependencies

```bash
npm install
```

## 8️⃣ Configure Frontend API

Create the appropriate environment configuration for your frontend API URL.

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, replace the local backend URL with your deployed backend URL.

---

## 9️⃣ Start Frontend

```bash
npm run dev
```

Vite will provide the local development URL, normally:

```text
http://localhost:5173
```

---

# 🏭 Production Build

## Backend

Build the backend:

```bash
npm run build
```

Start the compiled backend:

```bash
npm start
```

The backend configuration compiles TypeScript into the `build` directory and starts the compiled server from `build/server.js`.

## Frontend

Build the frontend:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

# 🔌 API Modules

The backend exposes API modules for:

```text
/api/auth
/api/users
/api/projects
/api/teams
/api/tasks
/api/repositories
/api/repository-files
/api/issues
/api/reports
/api/activities
/api/meetings
/api/ai
/api/notifications
/api/dashboard
```

The backend also provides a root health endpoint:

```text
GET /
```

which returns a backend status message when the server is running.

---

# 🤖 AI Capabilities

The AI subsystem is designed around project-management use cases rather than generic chatbot functionality.

### Project Insights

```text
POST /api/ai/insight
```

Generates AI-powered insights for a selected project.

### Task Prioritization

```text
POST /api/tasks/:id/ai-prioritize
```

Provides an AI-generated priority recommendation for a task.

### Meeting Summary

```text
PATCH /api/meetings/:id/ai-summary
```

Generates an AI summary for a meeting.

### Meeting Action Items

```text
PATCH /api/meetings/:id/action-items
```

Extracts actionable items from meeting information.

The backend exposes these AI operations through the AI controller and service layer.

---

# 🔐 Security

The application incorporates several security mechanisms:

* JWT authentication
* Password hashing using bcrypt
* HTTP security headers using Helmet
* CORS configuration
* Cookie parsing
* Request validation
* Role-based authorization
* Environment-based secret management
* MongoDB ObjectId validation
* Protected API operations

The backend validates required environment configuration, such as the MongoDB URI and JWT secret, before starting the application.

---

# 🌐 Deployment

The frontend is configured for Vercel deployment and includes a `vercel.json` rewrite that routes application requests to `index.html`, supporting client-side React routing.

### Frontend

Recommended deployment:

```text
Vercel
```

### Backend

The backend can be deployed to a Node.js-compatible hosting provider.

When deploying, configure the following environment variables:

```text
NODE_ENV
PORT
DB_URI
DB_NAME
JWT_SECRET
JWT_EXPIRES_IN
GEMINI_API_KEY
MAIL_USER
MAIL_PASSWORD
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
FRONTEND_URL
```

### CORS

Make sure the production frontend URL is added to the backend's allowed origins.

For example:

```env
FRONTEND_URL=https://your-production-domain.com
```

This is particularly important because the backend uses an allow-list for frontend origins and enables credentials.

---

# 🧪 Testing & Development

The backend includes dedicated development test scripts for Gemini connectivity and AI task prioritization.

Gemini connectivity can be tested using:

```bash
npx tsx src/test-gemini.ts
```

The repository also contains an AI task-prioritization test that supplies task context and validates the returned prioritization data.

---

# 🔄 Application Workflow

```text
User
 │
 ▼
Frontend
 │
 ├── Authentication
 │
 ├── Dashboard
 │
 ├── Projects
 │      ├── Teams
 │      ├── Tasks
 │      ├── Issues
 │      ├── Repository
 │      └── Meetings
 │
 ├── AI Assistant
 │      ├── Project Insights
 │      ├── Task Prioritization
 │      ├── Meeting Summary
 │      └── Action Items
 │
 └── Notifications
        │
        ▼
     REST API
        │
        ├── Express
        ├── Authentication
        ├── Authorization
        ├── Controllers
        └── Services
              │
              ├── MongoDB
              ├── Cloudinary
              ├── Gemini AI
              └── Socket.IO
```

---

# 👤 User Roles

The application supports role-based behavior, including:

* **ADMIN**
* **PROJECT_MANAGER**
* **TEAM_MEMBER**

The frontend and backend use these roles when determining permissions for project and meeting management.

---

# 📱 Responsive Interface

The frontend is built with React and Material UI and uses responsive layouts for application pages and components.

The application includes dedicated pages/components for:

* Dashboard
* Projects
* Tasks
* Teams
* Repositories
* Issues
* Meetings
* AI
* User management
* Notifications

---

# 🧩 Development Principles

The project follows a modular architecture with:

* Component-based frontend development
* Service-based API communication
* Controller/service separation
* TypeScript type safety
* Environment-based configuration
* Reusable UI components
* Role-based authorization
* RESTful API design
* Real-time event communication
* AI service abstraction

---

# 📈 Future Enhancements

Potential future improvements include:

* Advanced project analytics
* More AI-powered project recommendations
* Automated project health scoring
* Advanced team productivity analytics
* Improved repository integration
* More granular permission management
* Automated reminders and scheduling
* Enhanced notification preferences
* Comprehensive automated test coverage
* CI/CD automation
* API documentation with OpenAPI/Swagger

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

### 1. Fork the repository

```bash
git fork https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Commit your changes

```bash
git add .
git commit -m "feat: add your feature"
```

### 4. Push your branch

```bash
git push origin feature/your-feature-name
```

### 5. Open a Pull Request

Please provide a clear description of:

* What was changed
* Why the change was needed
* How it was tested
* Any relevant screenshots or API details

---

# 📄 License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for the full license text.

---

# 👨‍💻 Author

**Smart Project Management and Collaboration Platform**

Developed as a full-stack project demonstrating:

* Modern web application development
* Software architecture
* Database management
* REST API development
* Authentication and authorization
* Real-time communication
* Cloud integration
* Artificial intelligence integration
* Project and team collaboration

---

# ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

## 📌 Project Summary

**Smart Project Management and Collaboration Platform** brings project planning, task management, team collaboration, repository and issue tracking, meetings, notifications, reporting, real-time communication, and AI-powered project intelligence together in one centralized platform.

Built with:

```text
React + TypeScript + Vite
          +
Node.js + Express + TypeScript
          +
MongoDB + Mongoose
          +
Socket.IO
          +
Google Gemini AI
          +
Cloudinary
```

**Built to plan better. Collaborate faster. Manage smarter. 🚀**
