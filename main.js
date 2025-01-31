import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Pagination, TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { FaHome, FaStar, FaMoon, FaSun } from "react-icons/fa";

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
    setFavorites((prev) => (prev.includes(event.ID) ? prev.filter((id) => id !== event.ID) : [...prev, event.ID]));
  };

  const filteredEvents = events
    .filter((event) =>
      (categoryFilter ? event.Category === categoryFilter : true) &&
      Object.values(event).some((value) => (value || "").toString().toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => (sortOrder === "asc" ? (a[sortField] > b[sortField] ? 1 : -1) : a[sortField] < b[sortField] ? 1 : -1));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  return (
    <Container maxWidth="md" sx={{ backgroundColor: darkMode ? "#121212" : "#f5f5f5", color: darkMode ? "#ffffff" : "#000000", minHeight: "100vh", padding: 4 }}>
      <Typography variant="h4" gutterBottom>GlitchWatch</Typography>
      <IconButton onClick={() => setDarkMode(!darkMode)}>{darkMode ? <FaSun /> : <FaMoon />}</IconButton>
      {loading && <Typography>Loading events...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {!selectedEvent ? (
        <>
          <TextField fullWidth label="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <MenuItem value="">All Categories</MenuItem>
              {[...new Set(events.map((event) => event.Category))].map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Favorite</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((event) => (
                  <TableRow key={event.ID} onClick={() => setSelectedEvent(event)} sx={{ cursor: "pointer" }}>
                    <TableCell>{event.Category}</TableCell>
                    <TableCell>{event.Description}</TableCell>
                    <TableCell>{event.Location}</TableCell>
                    <TableCell>{event.Date_Reported}</TableCell>
                    <TableCell><a href={event.Source_Link} target="_blank" rel="noopener noreferrer">Link</a></TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => { e.stopPropagation(); toggleFavorite(event); }}>{favorites.includes(event.ID) ? "★" : "☆"}</IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination count={totalPages} page={currentPage} onChange={(event, value) => setCurrentPage(value)} sx={{ mt: 2, display: "flex", justifyContent: "center" }} />
        </>
      ) : (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5">{selectedEvent.Category}</Typography>
          <img src={selectedEvent.Image_Link} alt="Event" style={{ width: "100%", marginBottom: "16px" }} />
          <Typography><strong>Description:</strong> {selectedEvent.Description}</Typography>
          <Typography><strong>Resume:</strong> {selectedEvent.Resume}</Typography>
          <Typography><strong>Location:</strong> {selectedEvent.Location}</Typography>
          <Typography><strong>Date Reported:</strong> {selectedEvent.Date_Reported}</Typography>
          <Typography><strong>Source:</strong> <a href={selectedEvent.Source_Link} target="_blank" rel="noopener noreferrer">View Source</a></Typography>
          <Button onClick={() => setSelectedEvent(null)} variant="contained" sx={{ mt: 2 }}>Back</Button>
        </Paper>
      )}
    </Container>
  );
}
