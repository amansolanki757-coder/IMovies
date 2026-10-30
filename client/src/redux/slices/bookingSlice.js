import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosConfig';

export const fetchShowSeats = createAsyncThunk(
  'booking/fetchShowSeats',
  async (showId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/shows/${showId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch seats');
    }
  }
);

export const lockSeatsAction = createAsyncThunk(
  'booking/lockSeats',
  async ({ showId, seatNumbers }, { rejectWithValue }) => {
    try {
      const res = await API.post('/seats/lock', { showId, seatNumbers });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to lock seats');
    }
  }
);

export const createBookingAction = createAsyncThunk(
  'booking/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const res = await API.post('/bookings', bookingData);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm booking');
    }
  }
);

const initialState = {
  activeShow: null,
  seats: [],
  selectedSeats: [], // Array of seatNumber strings: ['A1', 'A2']
  lockExpiresAt: null,
  activeBooking: null,
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    toggleSeatSelection: (state, action) => {
      const seatNumber = action.payload;
      if (state.selectedSeats.includes(seatNumber)) {
        state.selectedSeats = state.selectedSeats.filter((s) => s !== seatNumber);
      } else {
        // Maximum 10 tickets per booking
        if (state.selectedSeats.length >= 10) return;
        state.selectedSeats.push(seatNumber);
      }
    },
    clearSelectedSeats: (state) => {
      state.selectedSeats = [];
      state.lockExpiresAt = null;
    },
    updateSeatRealtime: (state, action) => {
      const { seatNumbers, status, lockedBy } = action.payload;
      state.seats = state.seats.map((seat) => {
        if (seatNumbers.includes(seat.seatNumber)) {
          return { ...seat, status, lockedBy };
        }
        return seat;
      });
    },
    clearActiveBooking: (state) => {
      state.activeBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShowSeats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchShowSeats.fulfilled, (state, action) => {
        state.loading = false;
        state.activeShow = action.payload.show;
        state.seats = action.payload.seats;
        state.selectedSeats = [];
      })
      .addCase(fetchShowSeats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(lockSeatsAction.fulfilled, (state, action) => {
        state.lockExpiresAt = action.payload.lockExpiresAt;
      })
      .addCase(createBookingAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBookingAction.fulfilled, (state, action) => {
        state.loading = false;
        state.activeBooking = action.payload.booking;
        state.selectedSeats = [];
        state.lockExpiresAt = null;
      })
      .addCase(createBookingAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  toggleSeatSelection,
  clearSelectedSeats,
  updateSeatRealtime,
  clearActiveBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;

