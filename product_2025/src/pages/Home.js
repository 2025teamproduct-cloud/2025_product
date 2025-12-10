// ...existing code...
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import './Home.scss';

const Home = () => {
  const [genres, setGenres] = useState([]);
  const [stations, setStations] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 🔹 ログイン状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Firestore からジャンル一覧と駅一覧を取得
  useEffect(() => {
    const fetchGenresAndStations = async () => {
      try {
        const snapshot = await getDocs(collection(db, "shops"));
        const docs = snapshot.docs.map(doc => doc.data());

        const uniqueGenres = [
          ...new Set(docs.map(d => d.genre).filter(Boolean))
        ];
        setGenres(uniqueGenres);

        const uniqueStations = [
          ...new Set(docs.map(d => d.station).filter(Boolean))
        ];
        setStations(uniqueStations);
      } catch (error) {
        console.error('Firestore fetch error:', error);
      }
    };
    fetchGenresAndStations();
  }, []);

  return (
    <div className="home-container">
      <header className="header">
        <h2 className="title">ジャンルを選択</h2>
      </header>

      <div className="genre-buttons">
        {genres.map((genre, idx) => (
          <button
            key={idx}
            onClick={() => navigate(`/genre/${encodeURIComponent(genre)}`)}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* 最寄り駅の取得（重複を除く） */}
      <h2 className="station-title">最寄り駅を選択</h2>
      <div className="station-buttons">
        {stations.map((station, idx) => (
          <button
            key={idx}
            onClick={() => navigate(`/station/${encodeURIComponent(station)}`)}
          >
            {station}
          </button>
        ))}
      </div>

      {/* ▼ ランキングページへのリンク */}
      <div className="ranking-link-container">
        <button className="ranking-link-btn" onClick={() => navigate('/ranking')}>
          🏆 今月の訪問ランキングを見る
        </button>
      </div>

      {/* ▼ ログインしている場合のみ「店舗登録ページへ」表示 */}
      {user ? (
        <div className="admin-link-container">
          <button className="admin-link-btn" onClick={() => navigate('/admin')}>
            店舗登録ページへ
          </button>
        </div>
      ) : (
        <p className="login-message">
          店舗を登録するには <Link to="/login">ログイン</Link> してください。
        </p>
      )}

      <img src="Image.jpg" alt=""></img>
    </div>
  );
};

export default Home;
// ...existing