# Disaster Response System

A full-stack web application designed to facilitate rapid communication, reporting, and tracking of emergency situations during natural or man-made disasters. This system provides a platform for individuals to report incidents and receive automated, real-time email notifications for efficient disaster management.

## 🚀 Features

*   **User Authentication:** Secure registration and login functionalities.
*   **Data Isolation:** Users have a personalized dashboard displaying only their own reported incidents for privacy and clarity.
*   **Automated Email Notifications:** Instantly sends out formatted email alerts via Gmail SMTP integration (`Nodemailer`) when an emergency request is logged.
*   **Real-time Capabilities:** Configured with `socket.io` for future real-time updates and live map views of disaster zones.
*   **Responsive UI:** An intuitive, user-friendly frontend built with React that is easy to navigate in high-stress situations.
*   **Cloud Database:** Utilizes MongoDB Atlas for secure, highly available, and flexible data storage.

## 🛠️ Technology Stack

*   **Frontend:** React.js, HTML5, CSS3
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB (using Mongoose ODM)
*   **Integrations:** Nodemailer (Email Delivery), Socket.io (WebSockets)
*   **HTTP Client:** Axios (Frontend)

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v14 or higher)
*   [npm](https://www.npmjs.com/)
*   A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance running)
*   A Gmail account with **2-Step Verification** enabled and an **App Password** generated (for the notification system).

## ⚙️ Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-project-directory>
    ```

2.  **Install Backend Dependencies:**
    ```bash
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd disaster-frontend
    npm install
    cd ..
    ```

4.  **Environment Variables (.env Setup):**
    Create a `.env` file in the root directory and add the following keys based on the provided `.env.example`:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    EMAIL_USER=your_gmail_address
    EMAIL_PASS=your_gmail_app_password
    JWT_SECRET=your_secret_key
    ```
    *Note: Never commit your `.env` file to version control.*

## 🏃‍♂️ Running the Application

To run the full stack locally, you need to start both the backend server and the React frontend.

**1. Start the Backend Server:**
In the root directory, run:
```bash
npm start
```
*The server should be running on `http://localhost:5000` (or your configured port).*

**2. Start the Frontend Application:**
Open a new terminal window/tab, navigate to the frontend directory, and run:
```bash
cd disaster-frontend
npm start
```
*The React app should automatically open in your browser, typically on `http://localhost:3000`.*

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the issues page if you want to contribute.

## 📝 License

This project is licensed under the ISC License.
