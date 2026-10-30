# IMovies - Movie Ticket Booking Made Simple

A full-stack cinema management and movie ticket reservation system built with the MERN stack (MongoDB, Express.js, React.js, and Node.js). It incorporates secure JWT authentication, real-time seat availability tracking with Socket.io, role-based dashboards (User and Admin), and seamless ticket booking workflows.

## Key Features
- **User Authentication & Authorization**: Secure signup, login, password encryption with `bcryptjs`, and role-based access control with `jsonwebtoken` (JWT).
- **Movie Discovery & Show Scheduling**: Filter and search movies by genre, language, theatre, location, and date.
- **Real-Time Seat Booking**: Live interactive seat grid with instant availability status powered by `socket.io`.
- **Booking & Order History**: User dashboard for upcoming/past bookings and ticket cancellations.
- **Admin Management Panel**: Full CRUD operations for movies (with `multer` poster uploads), theatres, screen arrangements, and showtimes.
- **Optimized & Scalable**: MongoDB query indexing, API rate limiting, centralized error handling, and modular MVC architecture.

## Tech Stack
- **Frontend**: React.js, Redux, React Router, Bootstrap / Material UI, React Toastify, Axios
- **Backend**: Node.js, Express.js, Mongoose, Socket.io, Multer, Bcrypt.js, JSONWebToken
- **Database**: MongoDB

