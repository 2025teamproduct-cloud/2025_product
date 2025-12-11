import React, { useEffect, useState, useRef } from "react";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  isBookmarked,
  toggleBookmark,
} from "../utils/bookmarksUtils";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./StationPage.scss";
import { isVisited, toggleVisited } from "../utils/visitedUtils";

// 青ピン
const blueIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 赤ピン（OCA専用）
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// マップを店の位置に移動
const FlyToShop = ({ shop, markerRef }) => {
  const map = useMap();
  useEffect(() => {
    if (shop?.lat && shop?.lng && markerRef) {
      const offsetX = 150;
      const point = map.latLngToContainerPoint([shop.lat, shop.lng]);
      const targetPoint = L.point(point.x - offsetX, point.y);
      const targetLatLng = map.containerPointToLatLng(targetPoint);

      map.setView(targetLatLng, 18, { animate: true });
      markerRef.openPopup();
    }
  }, [shop, map, markerRef]);
  return null;
};

const StationPage = () => {
  const { station } = useParams();
  const [shops, setShops] = useState([]);
  const [oca, setOca] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [user, setUser] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [visitedIds, setVisitedIds] = useState([]);
  const navigate = useNavigate();
  const markerRefs = useRef({});

  // 認証状態監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Firestore から駅別ショップ取得
  useEffect(() => {
    const fetchShops = async () => {
      const q = query(collection(db, "shops"), where("station", "==", station));
      const snapshot = await getDocs(q);
      setShops(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            lat: data.LatLng?.latitude,
            lng: data.LatLng?.longitude,
          };
        })
      );
    };

    // OCA の情報取得
    const fetchOca = async () => {
      const docRef = doc(db, "default", "default");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setOca({
          id: snap.id,
          ...data,
          lat: data.LatLng?.latitude,
          lng: data.LatLng?.longitude,
        });
      }
    };

    fetchShops();
    fetchOca();
  }, [station]);

  // ブックマーク判定
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (user && shops.length > 0) {
        const results = await Promise.all(
          shops.map((shop) => isBookmarked(user.uid, shop.id))
        );
        setBookmarkedIds(
          shops.filter((_, i) => results[i]).map((s) => s.id)
        );
      }
    };
    fetchBookmarks();

    const fetchVisited = async () => {
      if (user && shops.length > 0) {
        const results = await Promise.all(
          shops.map((shop) => isVisited(user.uid, shop.id))
        );
        setVisitedIds(
          shops.filter((_, i) => results[i]).map((s) => s.id)
        );
      }
    };
    fetchVisited();
  }, [user, shops]);

  const handleBookmarkClick = async (shop) => {
    if (!user) {
      alert("ブックマークするにはログインが必要です。");
      return;
    }
    const newState = await toggleBookmark(user.uid, shop);
    setBookmarkedIds((prev) =>
      newState ? [...prev, shop.id] : prev.filter((id) => id !== shop.id)
    );
  };

  const handleVisitedClick = async (shop) => {
    if (!user) {
      alert("訪問記録にはログインが必要です。");
      return;
    }
    const newState = await toggleVisited(user.uid, shop);
    setVisitedIds((prev) =>
      newState ? [...prev, shop.id] : prev.filter((id) => id !== shop.id)
    );
  };

  return (
    <div className="genre-page">
      <div className="genre-content">
        <div className="genre-map">
          <MapContainer
            center={[34.672935, 135.492627]}
            zoom={18}
            minZoom={15}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* 駅に該当するショップ */}
            {shops.map((shop) => (
              <Marker
                key={shop.id}
                position={[shop.lat, shop.lng]}
                ref={(el) => (markerRefs.current[shop.id] = el)}
                icon={blueIcon}
                eventHandlers={{
                  click: () => setSelectedShop(shop),
                }}
              >
                <Popup>
                  <strong>{shop.name}</strong>
                  <br />
                  {shop.address}
                  <br />
                  <button
                    className="popup-bookmark-btn"
                    onClick={() => handleBookmarkClick(shop)}
                  >
                    {bookmarkedIds.includes(shop.id) ? "❤️ 解除" : "🤍 ブックマーク"}
                  </button>

                  <button
                    className={`visited-btn ${visitedIds.includes(shop.id) ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVisitedClick(shop);
                    }}
                  >
                    {visitedIds.includes(shop.id) ? "★ 訪問済み" : "☆ 行った！"}
                  </button>
                </Popup>
              </Marker>
            ))}

            {/* OCA（赤ピン） */}
            {oca && (
              <Marker
                key={oca.id}
                position={[oca.lat, oca.lng]}
                ref={(el) => (markerRefs.current[oca.id] = el)}
                icon={redIcon}
                eventHandlers={{
                  click: () => setSelectedShop(oca),
                }}
              >
                <Popup>
                  <strong>{oca.name}</strong>
                  <br />
                  {oca.address}
                </Popup>
              </Marker>
            )}

            {/* 選択した店へ移動 */}
            {selectedShop && (
              <FlyToShop
                shop={selectedShop}
                markerRef={markerRefs.current[selectedShop.id]}
              />
            )}
          </MapContainer>
        </div>

        {/* リスト */}
        <div className="genre-list">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className={`genre-shop-item ${selectedShop?.id === shop.id ? "active" : ""}`}
              onClick={() => setSelectedShop(shop)}
            >
              <div className="shop-name">{shop.name}</div>
              <div className="shop-meta">
                <span className="price">¥{shop.priceRange}</span>
                <span className="station"> / {shop.station}</span>
              </div>

              <div className="shop-actions">
                <button
                  className={`bookmark-btn ${bookmarkedIds.includes(shop.id) ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const btn = e.currentTarget;
                    handleBookmarkClick(shop);

                    setTimeout(() => {
                      btn.classList.add("spark");
                      setTimeout(() => btn.classList.remove("spark"), 700);
                    }, 50);
                  }}
                >
                  <span className="star-icon">
                    {bookmarkedIds.includes(shop.id) ? "❤️" : "🤍"}
                  </span>
                  <span className="sparkles"></span>
                </button>

                <button
                  className={`visited-btn ${visitedIds.includes(shop.id) ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVisitedClick(shop);
                  }}
                >
                  {visitedIds.includes(shop.id) ? "訪問済み" : "訪問する"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="genre-bottom">
        <h2>他の駅も見る</h2>
        <button className="genre-back-btn" onClick={() => navigate("/")}>
          戻る
        </button>
      </div>
    </div>
  );
};

export default StationPage;
