import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setGenre, setLanguage, resetFilters } from '../redux/slices/movieSlice';

const FilterBar = ({ currentStatus, setStatus }) => {
  const dispatch = useDispatch();
  const { selectedGenre, selectedLanguage } = useSelector((state) => state.movies);

  const genres = ['All', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Animation', 'Biography', 'Crime'];
  const languages = ['All', 'English', 'Hindi'];

  return (
    <div className="glass-card p-3 mb-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        {/* Status Switch (Now Showing / Coming Soon) */}
        <div className="btn-group p-1 bg-dark rounded-pill border border-secondary" role="group">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${currentStatus === 'now_showing' ? 'btn-danger' : 'text-white'}`}
            onClick={() => setStatus('now_showing')}
          >
            Now Showing
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${currentStatus === 'coming_soon' ? 'btn-danger' : 'text-white'}`}
            onClick={() => setStatus('coming_soon')}
          >
            Coming Soon
          </button>
        </div>

        {/* Genre Quick Filters */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          {genres.map((genre) => (
            <span
              key={genre}
              className={`badge-pill-custom ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => dispatch(setGenre(genre))}
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Language & Reset Controls */}
        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm bg-dark text-white border-secondary"
            value={selectedLanguage}
            onChange={(e) => dispatch(setLanguage(e.target.value))}
            style={{ width: '130px' }}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang === 'All' ? 'All Languages' : lang}
              </option>
            ))}
          </select>

          {(selectedGenre !== 'All' || selectedLanguage !== 'All') && (
            <button
              className="btn btn-sm btn-outline-secondary rounded-pill"
              onClick={() => dispatch(resetFilters())}
              title="Reset all filters"
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;

