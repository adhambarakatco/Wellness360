# Wellness360 - Full-Stack Fitness Tracker

https://wellness-360-client.onrender.com/

## Overview

**Wellness 360** is a full-stack fitness tracker web application designed to help users track and manage their workouts, nutrition, and sleep. The platform is built with a modern tech stack, including **Next.js**, **NestJS**, **MongoDB**, **TypeScript**, **JWT**, and **Docker**. It offers a polished, intuitive UI, secure token-based authentication, and is fully deployed and production-ready.

The application allows users to log daily activity, monitor progress, and set personal fitness goals. Admins have access to an analytics dashboard for managing users and monitoring engagement.

## Table of Contents

- [Project Description](#project-description)
- [Technologies Used](#technologies-used)
- [Features](#features)
  - [Core Features](#core-features)
  - [Post-MVP Features](#post-mvp-features)
- [User Stories and Backlog](#user-stories-and-backlog)
- [How to Run](#how-to-run)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [Evaluation Criteria](#evaluation-criteria)
- [Contact Information](#contact-information)

## Project Description

**Wellness 360** is designed to empower individuals, especially athletes and health-conscious users, to manage their fitness journey in a centralized, easy-to-use platform. With features like workout logging, meal tracking, sleep duration tracking, and goal-setting, **Wellness 360** aims to improve user engagement and provide data-driven insights to motivate users.

The platform leverages modern frameworks and tools like **Next.js** for the frontend, **NestJS** for the backend, and **MongoDB** for data storage. The use of **JWT** ensures secure, token-based authentication, while **Docker** allows for easy deployment and scalability.

## Technologies Used

- **Frontend**: Next.js, React, TypeScript
- **Backend**: NestJS, MongoDB, TypeScript, Swagger (API docs)
- **Authentication**: JWT (JSON Web Token)
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Testing**: Jest, Cypress, Postman

## Features

### Core Features

- **User Registration and Authentication**: Users can securely register and log in via email/password or Google OAuth. Admins have elevated privileges for managing the platform.
- **Personalized Fitness Profile**: Users can set up and update their fitness profile, including weight, height, and fitness goals.
- **Activity Tracking**: Users can log daily calories, workouts, and steps. Weekly and monthly activity trends are displayed in an easy-to-read format.
- **Meal Logging**: Users can log their meals manually or by selecting from pre-defined options, tracking their calorie intake.
- **Sleep Tracking**: Users can input their sleep start and end times to track their sleep patterns, with a chart showing weekly sleep duration.
- **Admin Dashboard**: Admins can manage users, view analytics, and send notifications to users for updates or alerts.
- **AI-Driven Recommendations**: Seamlessly integrates with your nutrition, workout, and sleep data to provide personalized health and fitness guidance tailored to your goals and lifestyle.

### Post-MVP Features

- **Advanced Analytics**: Users can compare calorie intake vs. burned calories over time and export data in CSV/PDF formats.
- **Social Sharing**: Users can share their achievements, such as workout milestones, on social media.
- **Wearable Device Integration**: Sync data with wearable devices like Fitbit or Apple Health to automatically track steps, heart rate, and sleep data.
- **Gamification**: Introduce achievements, challenges, and rewards to enhance user engagement.

## User Stories and Backlog

The product backlog for **Wellness 360** follows **MoSCoW** and **INVEST** criteria for prioritization, ensuring that the development process is efficient and focused on delivering essential features for the MVP (Minimum Viable Product). Below are some of the key user stories:

- **User Registration**: As a user, I want to register securely so that I can start tracking my fitness journey.
- **Activity Logging**: As a user, I want to log my daily calories and workouts so that I can track my progress.
- **Admin Management**: As an admin, I want to manage users and view analytics to ensure platform safety and monitor user engagement.
- **Notifications**: As a user, I want to receive notifications for updates or alerts regarding my fitness goals.

For a detailed list of user stories and the product backlog, refer to the document: [Wellness 360 User Stories - Product Backlog](file-64s17GGBBAXW5BBsdoyXqf).

## How to Run

To run the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/Wellness360.git
   cd Wellness360

2. **Install dependencies**:
    npm install

3. Set up environment variables: Create a .env file and configure your database connection and authentication keys.

4. **Run the application**:
   npm run dev

5. Access the app: Open http://localhost:3000 in your browser.

## Screenshots
Below are some screenshots of the app's user interface:
![Screenshot 2025-05-11 212451](https://github.com/user-attachments/assets/9fddab15-938f-4640-bffc-1518c861402b)
![image](https://github.com/user-attachments/assets/79be0929-b7f1-48a8-8df1-282b847b4079)
![Screenshot 2025-04-20 163721](https://github.com/user-attachments/assets/ef2da8a3-45b6-4ba7-a267-21ec807edc3b)
![image](https://github.com/user-attachments/assets/b6451814-f7bb-494b-889c-8906b9234697)
![Screenshot 2025-05-21 040847](https://github.com/user-attachments/assets/85ee7898-eaee-4bb9-9428-db9133c0e7a2)
![Screenshot 2025-05-21 040805](https://github.com/user-attachments/assets/e46b874a-8f34-4a85-beff-3219208996aa)
![Screenshot 2025-05-21 040455](https://github.com/user-attachments/assets/e49ab129-9b09-48ea-a29f-d9f07019ca70)
![Screenshot 2025-05-21 040357](https://github.com/user-attachments/assets/f5c0366a-3d58-458f-8f6a-a9c38bf561e3)
![Screenshot 2025-05-21 032800](https://github.com/user-attachments/assets/c14a6ffd-102e-4a69-bfe9-97831e05d7e7)
![Screenshot 2025-05-21 041137](https://github.com/user-attachments/assets/523907d3-852c-4408-81f5-0ab8a45170e3)
![Screenshot 2025-05-21 041045](https://github.com/user-attachments/assets/38748148-7d5b-47d5-8b70-dedce11f7b9d)
![Screenshot 2025-05-21 041033](https://github.com/user-attachments/assets/bbf51e3a-900c-4cb5-b70a-08c2a4781fd0)
![Screenshot 2025-05-21 040956](https://github.com/user-attachments/assets/982abc05-7b14-4f5c-bd84-627294ca1b1b)


## Future Enhancements
The following features are planned post-MVP:

AI-driven insights: Personalized fitness and nutrition recommendations based on user data.

Mobile App: Build a mobile version of the app for better accessibility.

Additional Integrations: Integration with other fitness tracking devices and third-party APIs.
