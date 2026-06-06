# CodeJudge Platform

A full-stack, feature-rich web application that replicates the core functionalities of Coding platform. Users can register, solve coding problems using an integrated code editor, track their progress, view solution videos, and even receive AI-powered assistance when stuck on a problem.

## 🚀 Key Features

* **User Authentication:** Secure email/OTP registration, JWT-based sessions, and Google OAuth 2.0 integration.
* **Integrated Code Editor:** Built-in IDE experience powered by Monaco Editor (`@monaco-editor/react`) for writing and executing algorithmic solutions.
* **AI Doubt Solver:** Deep integration with Google GenAI (`@google/genai`) to provide intelligent hints, debug code, and explain complex concepts.
* **Progress Tracking:** Dashboard to track solved/attempted problems, analyze submission history, and filter questions by difficulty and tags.
* **Solution Videos:** Seamless Cloudinary integration for uploading and viewing problem solution walkthroughs.
* **Modern UI/UX:** Responsive, beautifully designed interface using TailwindCSS v4 and DaisyUI.

---

## 🛠️ Tech Stack

### **Frontend**
* **Core:** React 19, Vite
* **State Management:** Redux Toolkit
* **Styling:** TailwindCSS v4, DaisyUI v5
* **Routing:** React Router v7
* **Forms & Validation:** React Hook Form, Zod
* **Editor:** Monaco Editor
* **Icons:** Lucide React
* **HTTP Client:** Axios

### **Backend**
* **Core:** Node.js, Express.js 5
* **Database:** MongoDB (Mongoose Object Modeling)
* **Caching:** Redis (Session & token management)
* **Authentication:** Passport.js (Google Auth), JWT, Bcrypt
* **Email Services:** Nodemailer (For OTP verification)
* **AI & Cloud Services:** Google GenAI SDK, Cloudinary

---

## 📂 Project Structure

```text
/
├── Backend/                 # Express.js Server
│   ├── src/
│   │   ├── config/          # DB, Redis, and Passport configurations
│   │   ├── controlers/      # API logic (Auth, Problems, Submissions, AI)
│   │   ├── middlewere/      # Auth and Admin protection guards
│   │   ├── models/          # Mongoose Schemas (User, Problem, Submission, etc.)
│   │   ├── routes/          # API route definitions
│   │   └── utils/           # Helper functions (OTP sender, validators)
│   └── package.json
│
└── Frontend/                # React Vite Application
    ├── src/
    │   ├── components/      # Reusable UI components (ChatAi, Editors, etc.)
    │   ├── pages/           # Route views (Homepage, Signup, Login, etc.)
    │   ├── utils/           # Axios client configurations
    │   └── authSlice.js     # Redux state for authentication
    └── package.json
```

---

## ⚙️ Local Setup & Installation

### 1. Prerequisites
Ensure you have the following installed on your machine:
* Node.js (v18 or higher)
* MongoDB (Local or Atlas URL)
* Redis Server
* Necessary API Keys (Google OAuth, Gemini AI, Cloudinary)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` directory and configure your secrets (DB URL, Redis URL, JWT Secret, API Keys, etc.).
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The application should now be running (typically accessible at `http://localhost:5173`).

---

## 📝 License
This project is open-source and available under the ISC License.
