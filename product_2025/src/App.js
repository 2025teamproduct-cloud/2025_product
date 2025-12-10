import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.js';
import MyPage from './pages/MyPage.js';
import ProfileEdit from './pages/ProfileEdit.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import GenrePage from './pages/GenrePage.js';
import AdminForm from './pages/AdminForm.js';
import './pages/Style.scss';
import Navbar from './pages/Navbar.js';
import MonthlyRanking from './pages/MonthlyRanking.js';
import StationPage from './pages/StationPage.js';

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/profile-edit" element={<ProfileEdit />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/genre/:genre" element={<GenrePage />} />
        <Route path="/admin" element={<AdminForm />} />
        <Route path="/ranking" element={<MonthlyRanking />} />
        <Route path="/station/:station" element={<StationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
