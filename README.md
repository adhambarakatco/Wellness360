# Wellness360 – Full-Stack Fitness Tracker Platform

🚀 Live Demo: [wellness-360-client.onrender.com](https://wellness-360-client.onrender.com/)
              
🚀 Live Demo: [wellness-360-server.onrender.com](https://wellness-360-server.onrender.com/)

---

## 📌 Overview

**Wellness360** is a full-stack, production-grade fitness tracking platform that empowers users to monitor and improve their overall wellness—covering workouts, nutrition, and sleep. Designed with a modern, modular architecture, it features secure authentication, scalable infrastructure, and an intuitive user interface.

Built with **Next.js**, **NestJS**, **MongoDB**, and **Docker**, Wellness360 offers both end-users and administrators a data-driven, interactive experience with real-time tracking, insightful analytics, and smart recommendations.

---

## ⚙️ Tech Stack

| Layer       | Technology                          |
|-------------|--------------------------------------|
| Frontend    | Next.js, React, TypeScript           |
| Backend     | NestJS, TypeScript, MongoDB          |
| Auth        | JWT (JSON Web Tokens), Google OAuth  |
| DevOps      | Docker, GitHub Actions               |
| Testing     | Jest, Cypress, Postman               |
| API Docs    | Swagger                              |

---

## ✨ Key Features

### 👤 User Functionality

- **Secure Registration & Login**  
  Supports email/password and Google OAuth with encrypted JWT-based authentication.

- **Personal Fitness Profiles**  
  Users can configure height, weight, goals, and preferences.

- **Workout & Activity Logging**  
  Daily tracking of steps, calories, and workouts with visual feedback with AI Assistancce for insersions.

- **Meal Tracking**  
  Manual and predefined meal logging to monitor calorie intake with AI Assistancce for insersions.

- **Sleep Tracking**  
  Logs and visualizes sleep duration with week-over-week analysis.

- **AI-Powered Health Suggestions**  
  Personalized recommendations for workout plans and nutrition plan based on fitness, nutrition, and sleep data.

- **Real-Time Notifications**  
  Users receive timely reminders, motivational nudges, and admin alerts through an integrated notification system.

- **Gemini AI Chatbot**  
  An intelligent virtual assistant designed to provide personalized support and guidance on nutrition, workouts, and overall wellness. It helps users stay informed, motivated, and on track with their fitness goals.



### 🛠️ Admin Functionality

- **Dashboard Analytics**  
  Visualize user engagement, activity patterns, and system usage metrics.

- **User Management**  
  Role-based user access, account moderation, and activity monitoring.

- **Broadcast Notifications**  
  Admins can push system-wide announcements or targeted alerts to users.

---

## 🔮 Post-MVP Enhancements

- Integration with **Fitbit** / **Apple Health** for wearable sync  
- **Gamification**: Badges, challenges, and rewards  
- **Data Export**: Generate CSV or PDF reports  
- **Social Sharing**: Share milestones on social platforms  
- Native **Mobile App** (React Native or Flutter)

---

## 👥 User Stories

- _As a user_, I can log daily workouts, meals, and sleep to stay on track with my goals with AI assistance.
- _As a user_, I get AI reccomdendation for a fully made workout plan made only for me using my profile details and logs for free.
- _As a user_, I receive notifications about goal progress, inactivity, or custom alerts.
- _As an admin_, I can manage users, view trends, and send platform updates or reminders.

For detailed user stories and backlog, refer to `docs/UserStories_Backlog.md`.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/adhambarakatco/Wellness360.git
cd Wellness360
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file at the root with:

```
MONGODB_URI=<your Mongo URI>
JWT_SECRET=<your JWT secret>
GOOGLE_CLIENT_ID=<Google OAuth client>
```

### 4. Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Screenshots

### Landing Page 
![image](https://github.com/user-attachments/assets/2089abd8-3377-4b53-81eb-1d224a52a738)
![image](https://github.com/user-attachments/assets/e5044e9f-e63f-4bcb-a69e-7a42e0e0b985)



### Dashboard

![Dashboard](https://github.com/user-attachments/assets/11ea46c7-51f4-4a4b-bd76-b920102bd1d6)

### Activity Tracking

![Workouts](https://github.com/user-attachments/assets/d14c8708-b5a0-4465-8a56-c0a7e52626be)

![Nutritiion](https://github.com/user-attachments/assets/c53411df-7c53-4fa1-8724-e484229bb6b8)

![Sleep](https://github.com/user-attachments/assets/d6532c4a-9873-4f56-9a67-21bbb87e5bf6)

### AI Recomendations
![AI Generated Workout plan](https://github.com/user-attachments/assets/8b82b56b-c083-4708-ae1a-7f3bcb9d1325)

### ChatBot
![ChatBot](https://github.com/user-attachments/assets/5782319a-f390-4814-8852-d52f84c05802)

### Real Time Notofication System
![Notifications](https://github.com/user-attachments/assets/0f5bc908-447f-4745-b793-732db1a8748b)

---

## ✅ Evaluation Criteria

- Modular full-stack architecture with reusable services
- RESTful API with Swagger documentation
- Token-based, role-aware access control
- Responsive UI/UX with dashboard visualizations
- Fully Dockerized for local or cloud deployment
- Unit and end-to-end test coverage with CI/CD

---

## 📫 Contact

**Adham Barakat**  
GitHub: [@adhambarakatco](https://github.com/adhambarakatco)  
LinkedIn: [linkedin.com/in/adhambarakat](www.linkedin.com/in/adham-hisham-barakat)
