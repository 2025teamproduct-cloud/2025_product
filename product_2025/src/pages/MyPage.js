// MyPage.js
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./MyPage.scss";

const MyPage = () => {
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  // 🔹 認証状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Firestore からブックマークを取得
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;
      const bookmarksRef = collection(db, "users", user.uid, "bookmarks");
      const snapshot = await getDocs(bookmarksRef);
      const sorted = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setBookmarks(sorted);
    };
    fetchBookmarks();
  }, [user]);

  // 🔹 ブックマーク削除
  const handleRemoveBookmark = async (shopId) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "bookmarks", shopId));
    setBookmarks((prev) => prev.filter((b) => b.id !== shopId));
  };

  const VisitedList = ({ uid }) => {
  const [visited, setVisited] = useState([]);

  useEffect(() => {
    const fetchVisited = async () => {
      const snapshot = await getDocs(collection(db, "users", uid, "visited"));
      const sorted = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => b.visitedAt?.seconds - a.visitedAt?.seconds);
      setVisited(sorted);
    };
    fetchVisited();
  }, [uid]);

  return visited.length > 0 ? (
    <ul className="visited-list">
      {visited.map((v) => (
        <li key={v.id}>
          <strong>{v.name}</strong>
          <br />
          <small>{v.address}</small>
          <br />
          <small>{v.genre}</small>
        </li>
      ))}
    </ul>
  ) : (
    <p>まだ訪問記録がありません。</p>
  );
};

  // 🔹 ログアウト処理
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // 🔹 プロフィール編集ページに移動
  const handleEditProfile = () => {
    navigate("/profile-edit");
  };

  // 表示用に直近5件か全件かを切り替え
  const displayedBookmarks = showAll ? bookmarks : bookmarks.slice(0, 5);

  return (
    <div className="mypage">
      {user ? (
        <>
          <div className="user-info">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="icon"
                width={80}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-icon.png";
                }}
              />
            )}
            <p className="username">
              ようこそ、{user.displayName || user.email} さん
            </p>

            <div className="mypage-buttons">
              <button onClick={handleEditProfile}>プロフィールを編集</button>
              <button onClick={handleLogout}>ログアウト</button>
            </div>
          </div>

          <hr />

          <div className="bookmarks-section">
            <h3>ブックマーク一覧</h3>
            {displayedBookmarks.length > 0 ? (
              <ul className="bookmark-list">
                {displayedBookmarks.map((b) => (
                  <li key={b.id} className="bookmark-item">
                    <div className="bookmark-info">
                      <p className="bookmark-name">{b.name}</p>
                      <p className="bookmark-address">{b.address}</p>
                      <small>
                        {b.genre} / {b.station}
                      </small>
                    </div>
                    <div className="bookmark-actions">
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveBookmark(b.id)}
                      >
                        削除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>まだブックマークがありません。</p>
            )}
            {bookmarks.length > 5 && (
              <button
                className="show-all-btn"
                onClick={() => setShowAll((prev) => !prev)}
              >
                {showAll ? "直近5件に戻す" : "すべて表示"}
              </button>
            )}
          </div>

          <hr />
          <div className="visited-section">
            <h3>訪問済み店舗</h3>
            {user ? (
              <VisitedList uid={user.uid} />
            ) : (
              <p>ログインしてください。</p>
            )}
          </div>

        </>
      ) : (
        <div className="not-logged-in">
          <p>ログインしていません。</p>
          <p>
            <a href="/login">こちら</a>からログインしてください。
          </p>
        </div>
      )}
    </div>
  );
};

export default MyPage;
