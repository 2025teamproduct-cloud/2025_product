// ...existing code...
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import './Home.scss';
import Image from "./img/Image.jpg";
import Image3 from "./img/Image3.jpg";
import Image4 from "./img/Image4.jpg";
import Image5 from "./img/Image5.jpg";
import Image6 from "./img/Image6.jpg";
import Image7 from "./img/Image7.jpg";

/* ▼▼ 追加：Swiper の import ▼▼ */
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
/* ▲▲ 追加：Swiper の import ▲▲ */

const Home = () => {
  const [genres, setGenres] = useState([]);
  const [stations, setStations] = useState([]);
  const [user, setUser] = useState(null);
  /* ★ 追加：スプラッシュ制御（初回のみ） */
  const [showSplash, setShowSplash] = useState(
    !localStorage.getItem('splashShown')
  );
  const navigate = useNavigate();

  // 🔹 ログイン状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  /* ★ 追加：一定時間後にスプラッシュ終了 */
  useEffect(() => {
    if (!showSplash) return;

    const timer = setTimeout(() => {
      setShowSplash(false);
      localStorage.setItem('splashShown', 'true');
    }, 4000);

    return () => clearTimeout(timer);
  }, [showSplash]);

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

      {/* ★ 追加：スプラッシュ（初回のみ） */}
      {showSplash && (
        <div className="splash">
          <img src={Image} alt="splash" />
        </div>
      )}

      {/* ▼▼ 追加：画像カルーセル ▼▼ */}
      <div className="home-carousel">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          loop={true}
          spaceBetween={10}
          slidesPerView={1}
        >
          <SwiperSlide>
            <img src={Image3} alt="3" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={Image4} alt="4" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={Image5} alt="5" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={Image6} alt="6" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={Image7} alt="7" />
          </SwiperSlide>
        </Swiper>
      </div>
      {/* ▲▲ 追加：画像カルーセル ▲▲ */}

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
    </div>
  );
};

export default Home;
// ...existing
