import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axiosConfig';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/admin/stats');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading administrative analytics...</span>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentBookings = data?.recentBookings || [];
  const topMovies = data?.topMovies || [];

  return (
    <div className="container py-4">
      {/* Admin Nav Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <span className="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bold mb-1">
            CONTROL CENTER
          </span>
          <h3 className="fw-bold text-white m-0">IMovies Executive Portal</h3>
          <p className="text-secondary small m-0">Cinema scheduling, catalog management & booking intelligence</p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/admin/movies" className="btn btn-sm btn-cinema">
            <i className="bi bi-film me-1"></i> Manage Movies
          </Link>
          <Link to="/admin/theatres" className="btn btn-sm btn-cinema-outline">
            <i className="bi bi-building me-1"></i> Theatres
          </Link>
          <Link to="/admin/shows" className="btn btn-sm btn-cinema-outline">
            <i className="bi bi-calendar-event me-1"></i> Schedule Shows
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-lg-2">
          <div className="glass-card p-3 text-center h-100">
            <i className="bi bi-cash-stack text-success fs-3 mb-1 d-block"></i>
            <div className="text-white fw-bold fs-5">₹{stats.totalRevenue || 0}</div>
            <div className="text-muted small">Total Revenue</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="glass-card p-3 text-center h-100">
            <i className="bi bi-ticket-perforated text-danger fs-3 mb-1 d-block"></i>
            <div className="text-white fw-bold fs-5">{stats.totalBookings || 0}</div>
            <div className="text-muted small">Confirmed Tickets</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="glass-card p-3 text-center h-100">
            <i className="bi bi-film text-warning fs-3 mb-1 d-block"></i>
            <div className="text-white fw-bold fs-5">{stats.totalMovies || 0}</div>
            <div className="text-muted small">Active Movies</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="glass-card p-3 text-center h-100">
            <i className="bi bi-building text-info fs-3 mb-1 d-block"></i>
            <div className="text-white fw-bold fs-5">{stats.totalTheatres || 0}</div>
            <div className="text-muted small">Multiplexes</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="glass-card p-3 text-center h-100">
            <i className="bi bi-calendar2-check text-primary fs-3 mb-1 d-block"></i>
            <div className="text-white fw-bold fs-5">{stats.activeShows || 0}</div>
            <div className="text-muted small">Active Shows</div>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="glass-card p-3 text-center h-100">
            <i className="bi bi-people text-secondary fs-3 mb-1 d-block"></i>
            <div className="text-white fw-bold fs-5">{stats.totalUsers || 0}</div>
            <div className="text-muted small">Registered Users</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Transactions & Bookings */}
        <div className="col-12 col-lg-8">
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-white m-0">Recent Customer Bookings</h5>
              <span className="badge bg-dark border border-secondary text-secondary">Live Feed</span>
            </div>

            {recentBookings.length === 0 ? (
              <div className="text-center py-4 text-muted small">No bookings recorded yet</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr className="text-secondary small border-secondary">
                      <th>CODE</th>
                      <th>CUSTOMER</th>
                      <th>MOVIE</th>
                      <th>SEATS</th>
                      <th>PAID</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b._id} className="border-secondary">
                        <td className="fw-bold text-warning small">{b.bookingCode}</td>
                        <td className="small text-white">{b.userId?.name || 'User'}</td>
                        <td className="small text-white text-truncate" style={{ maxWidth: '140px' }}>
                          {b.showId?.movieId?.title || 'Movie'}
                        </td>
                        <td className="small text-secondary">{b.seatNumbers.join(', ')}</td>
                        <td className="small fw-bold text-white">₹{b.totalAmount}</td>
                        <td>
                          <span
                            className={`badge ${b.status === 'confirmed' ? 'bg-success' : 'bg-danger'} rounded-pill`}
                            style={{ fontSize: '0.65rem' }}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Top Grossing Movies */}
        <div className="col-12 col-lg-4">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold text-white mb-3">Top Grossing Films</h5>
            {topMovies.length === 0 ? (
              <div className="text-center py-4 text-muted small">No ticket sales aggregated yet</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {topMovies.map((item, idx) => (
                  <div key={item._id} className="d-flex align-items-center gap-3">
                    <span className="fw-bold text-danger fs-5" style={{ width: '20px' }}>
                      #{idx + 1}
                    </span>
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="rounded-2"
                      style={{ width: '42px', height: '58px', objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-bold text-white text-truncate small">{item.title}</div>
                      <div className="text-secondary small">{item.ticketsSold} seats reserved</div>
                    </div>
                    <div className="text-end fw-bold text-success small">
                      ₹{item.revenue}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

