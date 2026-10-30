import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const MovieManager = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState('');
  const [language, setLanguage] = useState('English');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [rating, setRating] = useState(8.5);
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('now_showing');
  const [posterUrl, setPosterUrl] = useState('');
  const [posterFile, setPosterFile] = useState(null);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await API.get('/movies?limit=100');
      setMovies(res.data.movies || []);
    } catch (err) {
      toast.error('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const resetForm = () => {
    setEditingMovie(null);
    setTitle('');
    setDescription('');
    setGenres('');
    setLanguage('English');
    setDurationMinutes(120);
    setRating(8.5);
    setReleaseDate(new Date().toISOString().split('T')[0]);
    setStatus('now_showing');
    setPosterUrl('');
    setPosterFile(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    setTitle(movie.title);
    setDescription(movie.description);
    setGenres(movie.genres?.join(', ') || '');
    setLanguage(movie.language);
    setDurationMinutes(movie.durationMinutes);
    setRating(movie.rating);
    setReleaseDate(movie.releaseDate ? movie.releaseDate.split('T')[0] : '');
    setStatus(movie.status);
    setPosterUrl(movie.poster);
    setPosterFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('genres', genres);
      formData.append('language', language);
      formData.append('durationMinutes', durationMinutes);
      formData.append('rating', rating);
      formData.append('releaseDate', releaseDate);
      formData.append('status', status);

      if (posterFile) {
        formData.append('poster', posterFile);
      } else if (posterUrl) {
        formData.append('poster', posterUrl);
      }

      if (editingMovie) {
        await API.put(`/movies/${editingMovie._id}`, formData);
        toast.success('Movie updated successfully');
      } else {
        await API.post('/movies', formData);
        toast.success('New movie created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving movie');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie? Associated shows will be deactivated.')) {
      return;
    }
    try {
      await API.delete(`/movies/${id}`);
      toast.success('Movie deleted successfully');
      fetchMovies();
    } catch (err) {
      toast.error('Failed to delete movie');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <Link to="/admin" className="text-secondary small text-decoration-none mb-1 d-inline-block">
            <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
          </Link>
          <h3 className="fw-bold text-white m-0">Movie Catalog Management</h3>
        </div>

        <button className="btn btn-cinema" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-2"></i> Add New Movie
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : (
        <div className="glass-card p-4">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
              <thead>
                <tr className="text-secondary small border-secondary">
                  <th>POSTER</th>
                  <th>TITLE</th>
                  <th>GENRES</th>
                  <th>LANG</th>
                  <th>DURATION</th>
                  <th>RATING</th>
                  <th>STATUS</th>
                  <th className="text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id} className="border-secondary">
                    <td style={{ width: '60px' }}>
                      <img
                        src={m.poster}
                        alt={m.title}
                        className="rounded-2"
                        style={{ width: '40px', height: '55px', objectFit: 'cover' }}
                      />
                    </td>
                    <td className="fw-bold text-white">{m.title}</td>
                    <td className="text-secondary small">{m.genres?.join(', ')}</td>
                    <td className="text-white small">{m.language}</td>
                    <td className="text-secondary small">{m.durationMinutes}m</td>
                    <td>
                      <span className="badge bg-warning text-dark fw-bold">★ {m.rating}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${m.status === 'now_showing' ? 'bg-success' : 'bg-secondary'}`}
                      >
                        {m.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-info me-2"
                        onClick={() => handleOpenEdit(m)}
                        title="Edit Movie"
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(m._id)}
                        title="Delete Movie"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ background: 'rgba(0,0,0,0.85)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content glass-card text-white border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold">
                  {editingMovie ? 'Edit Movie' : 'Add New Movie to Catalog'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Movie Title *</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-white"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Genres (comma separated) *</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-white"
                        placeholder="Action, Sci-Fi, Adventure"
                        value={genres}
                        onChange={(e) => setGenres(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-secondary">Synopsis / Description *</label>
                      <textarea
                        className="form-control bg-dark border-secondary text-white"
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="form-label small text-secondary">Language</label>
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-white"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="form-label small text-secondary">Duration (Minutes)</label>
                      <input
                        type="number"
                        className="form-control bg-dark border-secondary text-white"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="form-label small text-secondary">Rating (0-10)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control bg-dark border-secondary text-white"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="form-label small text-secondary">Status</label>
                      <select
                        className="form-select bg-dark border-secondary text-white"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="now_showing">Now Showing</option>
                        <option value="coming_soon">Coming Soon</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Poster URL</label>
                      <input
                        type="url"
                        className="form-control bg-dark border-secondary text-white"
                        placeholder="https://..."
                        value={posterUrl}
                        onChange={(e) => setPosterUrl(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Or Upload Poster Image (Multer)</label>
                      <input
                        type="file"
                        className="form-control bg-dark border-secondary text-white"
                        accept="image/*"
                        onChange={(e) => setPosterFile(e.target.files[0])}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema">
                    {editingMovie ? 'Update Movie' : 'Save Movie'}
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

export default MovieManager;

