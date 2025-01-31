import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaHome, FaStar, FaComment, FaUser, FaMoon, FaSun } from "react-icons/fa";

const SUPABASE_URL = "https://kitmcblvwrytzehtivvd.supabase.co";
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdG1jYmx2d3J5dHplaHRpdnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMjA1ODIsImV4cCI6MjA1Mzg5NjU4Mn0.Bjwa8r6W0mrIfxf_4FICpKxgwj2ZMVp70ei2KS2bsqA";
const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);
const TABLE_NAME = "Anomalie";

export default function EventDatabaseApp() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [sortField, setSortField] = useState("Date_Reported");
  const [sortOrder, setSortOrder] = useState("asc");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase.from(TABLE_NAME).select("*");
      if (error) setError("Failed to fetch data");
      else setEvents(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const toggleFavorite = (event) => {
    setFavorites(prev => prev.includes(event.ID) ? prev.filter(id => id !== event.ID) : [...prev, event.ID]);
  };

  const filteredEvents = events
    .filter(event =>
      (categoryFilter ? event.Category === categoryFilter : true) &&
      Object.values(event).some(value =>
        (value || "").toString().toLowerCase().includes(search.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortOrder === "asc") return a[sortField] > b[sortField] ? 1 : -1;
      return a[sortField] < b[sortField] ? 1 : -1;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  return (
    <div className={`container py-4 ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}>
      <nav className="navbar navbar-expand-lg navbar-light bg-white mb-4">
        <div className="container-fluid">
          <a className="navbar-brand" href="#"><FaHome /></a>
          <span className="navbar-text ms-2 fs-4 fw-bold">GlitchWatch</span>
          <button onClick={() => setDarkMode(!darkMode)} className="btn btn-outline-secondary ms-auto">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </nav>
      {loading && <p>Loading events...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!selectedEvent && (
        <>
          <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-control mb-4" />
          <select onChange={(e) => setCategoryFilter(e.target.value)} className="form-select mb-4">
            <option value="">All Categories</option>
            {[...new Set(events.map(event => event.Category))].map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </>
      )}
      {selectedEvent ? (
        <div className="card p-4">
          <h2>{selectedEvent.Category}</h2>
          <img src={selectedEvent.Image_Link} alt="Event" className="img-fluid mb-3" />
          <p><strong>Description:</strong> {selectedEvent.Description}</p>
          <p><strong>Resume:</strong> {selectedEvent.Resume}</p>
          <p><strong>Location:</strong> {selectedEvent.Location}</p>
          <p><strong>Date Reported:</strong> {selectedEvent.Date_Reported}</p>
          <p><strong>Source:</strong> <a href={selectedEvent.Source_Link} target="_blank" rel="noopener noreferrer">View Source</a></p>
          <p><a href={`https://www.google.com/maps/search/?api=1&query=${selectedEvent.Location}`} target="_blank" rel="noopener noreferrer">View on Map</a></p>
          <button onClick={() => setSelectedEvent(null)} className="btn btn-secondary mt-4">Back</button>
        </div>
      ) : (
        <div>
          <table className="table table-hover">
            <thead>
              <tr>
                <th onClick={() => setSortField("Category")}>Category</th>
                <th onClick={() => setSortField("Description")}>Description</th>
                <th onClick={() => setSortField("Location")}>Location</th>
                <th onClick={() => setSortField("Date_Reported")}>Date</th>
                <th>Source</th>
                <th>Favorite</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(event => (
                <tr key={event.ID} onClick={() => setSelectedEvent(event)} style={{ cursor: "pointer" }}>
                  <td>{event.Category}</td>
                  <td>{event.Description}</td>
                  <td>{event.Location}</td>
                  <td>{event.Date_Reported}</td>
                  <td><a href={event.Source_Link} target="_blank" rel="noopener noreferrer">Link</a></td>
                  <td>
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(event); }} className="btn btn-secondary">
                      {favorites.includes(event.ID) ? "★" : "☆"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-between mt-3">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="btn btn-secondary">Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="btn btn-secondary">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
