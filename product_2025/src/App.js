import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MyPage from './pages/MyPage';
import ProfileEdit from './pages/ProfileEdit'; // 追加
import Login from './pages/Login';
import Register from './pages/Register';
import GenrePage from './pages/GenrePage';
import AdminForm from './pages/AdminForm';
import './pages/Style.scss';
import Navbar from './pages/Navbar';
import MonthlyRanking from './pages/MonthlyRanking';
import StationPage from './pages/StationPage';

function App() {
  return (
    <Router>
      <Navbar /> {/* 全ページ共通で表示 */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/profile-edit" element={<ProfileEdit />} /> {/* 新規追加 */}
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
