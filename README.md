## Kevin's Gym Management App

<p align="center">
  <img src="./frontend/public/welcome_img.png" alt="Welcome Image">
</p>

Welcome to my gym management app.
This is a full-stack web application designed to help gym owners manage gym members, course vendors, and daily gym operations. It has role-based access control for Admins, Gym Members, and Course Vendors.

---

### Main Features

- **Authentication & Authorization**: Register or login to access role-specific panels for Admins, Gym Members, and Course Vendors.
- **Admin Panel**: Manage all user accounts (create, edit, delete) and broadcast system notifications to members or vendors.
- **Member Panel**: View and edit profile, browse and book gym classes, reschedule or cancel bookings.
- **Vendor Panel**: Create, edit, and delete gym courses; view notifications targeted to vendors.
- **Class Booking**: Browse available classes, book a spot, cancel or reschedule existing bookings.
- **System Notifications**: Admin can send notifications to members, vendors, or all users; stored in MongoDB.
- **Design Patterns**: Observer pattern (event logging and notifications), Strategy pattern (JWT authentication), Singleton pattern (database connection).
- **MongoDB Atlas**: Cloud database for storing users, bookings, classes, courses, and notifications.

---

### How to Run the App Locally

1. **Install Dependencies**

   ```powershell
   npm install -g concurrently
   npm run install-all
   ```

2. **Set up Environment Variables**

   Create a `.env` file under the `backend` directory:

   ```env
   PORT=6001
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/myDatabase
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Start the Application**

   ```powershell
   npm run dev
   ```

4. **Open the App**

   Once the app is running, open your browser and go to:

   ```
   http://localhost:3000
   ```

   You will see the login page. Register a new account or use an existing one to log in.

   **Note**: This app is also hosted on AWS EC2. You can visit it at `http://[Your-EC2-Public-IP]`.
