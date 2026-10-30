import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const TheatreManager = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [address, setAddress] = useState('');
  const [screensCount, setScreensCount] = useState(2);
  const [facilities, setFacilities] = useState('Dolby Atmos, 4K Projection, Recliners, Food Court');

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      const res = await API.get('/theatres');
      setTheatres(res.data.theatres || []);
    } catch (err) {
      toast.error('Failed to load theatres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const screens = [];
      for (let i = 1; i <= parseInt(screensCount, 10); i++) {
        screens.push({ screenNumber: i, name: `Auditorium ${i}`, totalSeats: 60 });
      }

      await API.post('/theatres', {
        name,
        city,
        address,
        screens,
        facilities: facilities.split(',').map((f) => f.trim()),
      });

      toast.success('Theatre added successfully');
      setShowModal(false);
      setName('');
      setAddress('');
      fetchTheatres();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding theatre');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this theatre location?')) return;
    try {
      await API.delete(`/theatres/${id}`);
      toast.success('Theatre deleted');
      fetchTheatres();
    } catch (err) {
      toast.error('Error deleting theatre');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <Link to="/admin" className="text-secondary small text-decoration-none mb-1 d-inline-block">
            <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
          </Link>
          <h3 className="fw-bold text-white m-0">Theatres & Multiplex Management</h3>
        </div>

        <button className="btn btn-cinema" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i> Add Multiplex
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : (
        <div className="row g-4">
          {theatres.map((t) => (
            <div key={t._id} className="col-12 col-md-6">
              <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold text-white m-0">{t.name}</h5>
                    <span className="badge bg-danger px-3 py-1 rounded-pill">{t.city}</span>
                  </div>
                  <p className="text-secondary small mb-3">{t.address}</p>

                  <div className="mb-3">
                    <div className="text-white small fw-bold mb-1">Screens ({t.screens?.length || 1}):</div>
                    <div className="d-flex flex-wrap gap-1">
                      {t.screens?.map((s) => (
                        <span key={s.screenNumber} className="badge bg-dark border border-secondary text-secondary">
                          Screen {s.screenNumber} ({s.totalSeats} seats)
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-white small fw-bold mb-1">Amenities:</div>
                    <div className="d-flex flex-wrap gap-1">
                      {t.facilities?.map((f) => (
                        <span key={f} className="badge bg-dark text-muted" style={{ fontSize: '0.7rem' }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-top border-secondary text-end">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(t._id)}
                  >
                    <i className="bi bi-trash-fill me-1"></i> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card text-white border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold">Register New Theatre</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Theatre / Multiplex Name *</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-white"
                      placeholder="e.g. PVR INOX Gold"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">City *</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-white"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Total Screens</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="form-control bg-dark border-secondary text-white"
                        value={screensCount}
                        onChange={(e) => setScreensCount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Full Street Address *</label>
                    <textarea
                      className="form-control bg-dark border-secondary text-white"
                      rows="2"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Facilities (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control bg-dark border-secondary text-white"
                      value={facilities}
                      onChange={(e) => setFacilities(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema">
                    Save Theatre
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheatreManager;

