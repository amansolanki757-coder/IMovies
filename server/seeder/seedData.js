import mongoose from 'mongoose';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Show from '../models/Show.js';
import Seat from '../models/Seat.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { generateSeatsForShow } from '../controllers/showController.js';

export const seedDatabase = async () => {
  try {
    const movieCount = await Movie.countDocuments();
    if (movieCount > 0) {
      console.log('[Seeder] Database already populated with seed data.');
      return;
    }

    console.log('[Seeder] Initializing sample data for IMovies...');

    // 1. Create Default Users
    const adminUser = await User.create({
      name: 'IMovies Admin',
      email: 'admin@imovies.com',
      password: 'adminpassword123',
      phone: '+91 9876543210',
      role: 'admin',
    });

    const demoUser = await User.create({
      name: 'Aman Solanki',
      email: 'user@imovies.com',
      password: 'userpassword123',
      phone: '+91 9123456780',
      role: 'user',
    });

    console.log('[Seeder] Users created (admin@imovies.com / user@imovies.com)');

    // 2. Create Blockbuster Movies
    const movies = await Movie.insertMany([
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        language: 'English',
        durationMinutes: 166,
        releaseDate: new Date('2024-03-01'),
        rating: 8.6,
        poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
        backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        director: 'Denis Villeneuve',
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        status: 'now_showing',
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
        genres: ['Biography', 'Drama', 'History'],
        language: 'English',
        durationMinutes: 180,
        releaseDate: new Date('2023-07-21'),
        rating: 8.9,
        poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
        backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        director: 'Christopher Nolan',
        cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        status: 'now_showing',
      },
      {
        title: 'Interstellar',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers.',
        genres: ['Adventure', 'Drama', 'Sci-Fi'],
        language: 'English',
        durationMinutes: 169,
        releaseDate: new Date('2014-11-07'),
        rating: 8.7,
        poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
        backdrop: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
        director: 'Christopher Nolan',
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        status: 'now_showing',
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
        genres: ['Animation', 'Action', 'Adventure'],
        language: 'English',
        durationMinutes: 140,
        releaseDate: new Date('2023-06-02'),
        rating: 8.7,
        poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
        backdrop: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
        director: 'Joaquim Dos Santos',
        cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        status: 'now_showing',
      },
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
        genres: ['Action', 'Crime', 'Drama'],
        language: 'English',
        durationMinutes: 152,
        releaseDate: new Date('2008-07-18'),
        rating: 9.0,
        poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80',
        backdrop: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=1200&q=80',
        director: 'Christopher Nolan',
        cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
        trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        status: 'now_showing',
      },
      {
        title: 'Avatar: Fire and Ash',
        description: 'The upcoming continuation of James Cameron epic sci-fi saga exploring the hostile ash people of Pandora.',
        genres: ['Action', 'Adventure', 'Fantasy', 'Sci-Fi'],
        language: 'English',
        durationMinutes: 190,
        releaseDate: new Date('2026-12-19'),
        rating: 9.1,
        poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        director: 'James Cameron',
        cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'],
        trailerUrl: '',
        status: 'coming_soon',
      },
    ]);

    console.log('[Seeder] 6 Movies seeded.');

    // 3. Create Multiplex Theatres
    const theatres = await Theatre.insertMany([
      {
        name: 'PVR INOX IMAX',
        city: 'Mumbai',
        address: 'High Street Phoenix, Lower Parel, Mumbai, Maharashtra 400013',
        screens: [
          { screenNumber: 1, name: 'IMAX Laser 1', totalSeats: 60 },
          { screenNumber: 2, name: 'Gold Class 2', totalSeats: 60 },
        ],
        facilities: ['IMAX Laser', 'Dolby Atmos', 'Gold Lounge', 'Gourmet Dining', 'Valet Parking'],
      },
      {
        name: 'Cinepolis VIP Megaplex',
        city: 'Delhi',
        address: 'DLF Avenue, Saket, New Delhi, Delhi 110017',
        screens: [
          { screenNumber: 1, name: 'VIP Screen 1', totalSeats: 60 },
          { screenNumber: 2, name: '4DX Screen 2', totalSeats: 60 },
        ],
        facilities: ['4DX', 'RealD 3D', 'VIP Recliners', 'Food Court', 'Coffee Bar'],
      },
      {
        name: 'PVR Superplex',
        city: 'Bangalore',
        address: 'Forum Mall, Koramangala, Bengaluru, Karnataka 560095',
        screens: [
          { screenNumber: 1, name: 'Atmos Screen 1', totalSeats: 60 },
          { screenNumber: 2, name: 'PlayHouse 2', totalSeats: 60 },
        ],
        facilities: ['Dolby Atmos', '4K Projection', 'Game Zone', 'Café'],
      },
      {
        name: 'Prasad Multiplex & IMAX',
        city: 'Hyderabad',
        address: 'NTR Gardens, Khairatabad, Hyderabad, Telangana 500004',
        screens: [
          { screenNumber: 1, name: 'Giant Screen 1', totalSeats: 60 },
        ],
        facilities: ['Giant Screen', '70mm Projection', 'Food Arcade', 'Ample Parking'],
      },
    ]);

    console.log('[Seeder] 4 Theatres seeded.');

    // 4. Generate Showtimes & Seat Layouts
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const showtimes = ['10:30 AM', '02:00 PM', '06:30 PM', '10:00 PM'];
    let showCounter = 0;

    for (const theatre of theatres) {
      for (let i = 0; i < 3; i++) {
        const movie = movies[i];
        for (const dateStr of [todayStr, tomorrowStr]) {
          for (const time of showtimes.slice(0, 2)) {
            const show = await Show.create({
              movieId: movie._id,
              theatreId: theatre._id,
              screenNumber: 1,
              showDate: dateStr,
              showTime: time,
              ticketPrice: 280,
            });

            await generateSeatsForShow(show._id);
            showCounter++;

            // Create 1 sample booking for demonstration
            if (showCounter === 1) {
              const bookedSeats = ['D5', 'D6'];
              await Seat.updateMany(
                { showId: show._id, seatNumber: { $in: bookedSeats } },
                { status: 'booked' }
              );

              const booking = await Booking.create({
                userId: demoUser._id,
                showId: show._id,
                seatNumbers: bookedSeats,
                seatDetails: [
                  { seatNumber: 'D5', seatType: 'Prime', price: 350 },
                  { seatNumber: 'D6', seatType: 'Prime', price: 350 },
                ],
                totalAmount: 700,
                bookingCode: 'IMV-DEMO88',
                status: 'confirmed',
              });

              await Payment.create({
                bookingId: booking._id,
                userId: demoUser._id,
                amount: 700,
                paymentMethod: 'UPI',
                transactionId: 'TXN-DEMO-999888',
                status: 'success',
              });

              await Notification.create({
                userId: demoUser._id,
                title: 'Welcome to IMovies!',
                message: `You have an active booking (${booking.bookingCode}) for "${movie.title}". Enjoy the show!`,
                type: 'booking',
                link: `/booking/${booking._id}`,
              });
            }
          }
        }
      }
    }

    console.log(`[Seeder] ${showCounter} Shows and Seat Grids successfully seeded!`);
  } catch (error) {
    console.error('[Seeder Error]', error);
  }
};

