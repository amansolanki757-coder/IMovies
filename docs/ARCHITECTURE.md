# IMovies System Architecture Documentation

## Architectural Overview
IMovies is structured following the standard **MVC (Model-View-Controller)** pattern with a decoupled frontend single-page application (SPA) built with React and Vite, communicating via RESTful APIs and WebSocket channels with an Express.js backend.

```
                           +-------------------------------+
                           |      React Client (SPA)       |
                           |   (Vite + Redux + Bootstrap)  |
                           +---------------+---------------+
                                           |
                         HTTP REST Requests| WebSocket Events
                           (Axios + JWT)   | (Socket.io)
                                           v
                           +---------------+---------------+
                           |      Express.js Backend       |
                           | (Node.js + Rate Limiter + JWT)|
                           +---------------+---------------+
                                           |
                                Mongoose ODM / Queries
                                           v
                           +---------------+---------------+
                           |       MongoDB Database        |
                           |   (8 Normalized Collections)  |
                           +-------------------------------+
```

## Security & Access Control
- **Authentication**: Stateless JSON Web Tokens (JWT) issued on login, stored securely on client, sent via `Authorization: Bearer <token>` header.
- **Passwords**: Hashed with salt rounds using `bcryptjs`.
- **Authorization Middleware**:
  - `protect`: Verifies active JWT and attaches user object to request.
  - `adminOnly`: Restricts write/delete access on movies, theatres, and shows to users with `role: 'admin'`.
- **API Rate Limiting**: Centralized `express-rate-limit` to prevent brute force on authentication and checkout routes.

## Real-Time Seat Synchronization (Socket.io)
1. When a user navigates to the seat selection screen, the client joins a room named `show:<showId>`.
2. When a user clicks to select/lock seats, the server locks those seats for a 10-minute checkout window and broadcasts `seat:locked` with the seat numbers to all users currently in that room.
3. If the user completes the booking, the server broadcasts `seat:booked`.
4. If the timer expires or the user leaves, the server releases the hold and broadcasts `seat:released`.

