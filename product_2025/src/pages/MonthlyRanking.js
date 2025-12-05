"use client";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collectionGroup,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import "./MonthlyRanking.scss";

const MonthlyRanking = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  // ▼ 各ユーザーごとの“開閉状態”を管理
  const [openUsers, setOpenUsers] = useState({});

  const toggleOpen = (userId) => {
    setOpenUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const now = new Date();

        const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const start = Timestamp.fromDate(startDate);
        const end = Timestamp.fromDate(endDate);

        const q = query(
          collectionGroup(db, "visited"),
          where("visitedAt", ">=", start),
          where("visitedAt", "<=", end)
        );

        const snapshot = await getDocs(q);

        const userData = {};

        snapshot.forEach((docSnap) => {
          const parent = docSnap.ref.parent;
          const userId = parent.parent.id;
          const data = docSnap.data();

          if (!userData[userId]) {
            userData[userId] = { count: 0, shops: [] };
          }

          userData[userId].count += 1;
          userData[userId].shops.push(data.name);
        });

        const sorted = Object.entries(userData)
          .map(([userId, d]) => ({
            userId,
            count: d.count,
            shops: d.shops,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        const rankingWithNames = await Promise.all(
          sorted.map(async (r) => {
            const userDoc = await getDoc(doc(db, "users", r.userId));
            const userData = userDoc.exists() ? userDoc.data() : {};
            return {
              ...r,
              displayName: userData.displayName || "匿名ユーザー",
            };
          })
        );

        setRanking(rankingWithNames);
      } catch (err) {
        console.error("ランキング取得エラー:", err);
      }
      setLoading(false);
    };

    fetchRanking();
  }, []);

  if (loading) return <p>ランキングを読み込み中...</p>;
  if (ranking.length === 0) return <p>今月の訪問データがありません。</p>;

  return (
    <div className="ranking-container">
      <h2>今月の訪問ランキング</h2>
      <ol className="ranking-list">

        {ranking.map((r, i) => (
          <li key={r.userId} className="ranking-item">
            <div className="main-row">
              <span className="rank-num">{i + 1}位</span>

              <div className="name">{r.displayName} さん</div>

              <div className="right-box">
                <div className="count">{r.count} 店舗</div>

                <div
                  className="toggle-icon"
                  onClick={() => toggleOpen(r.userId)}
                >
                  {openUsers[r.userId] ? "▲" : "▼"}
                </div>
              </div>
            </div>

            {/* 折りたたみ領域 */}
            {openUsers[r.userId] && (
              <ul className="shop-list">
                {r.shops.map((shop, idx) => (
                  <li key={idx}>{shop}</li>
                ))}
              </ul>
            )}
          </li>
        ))}

      </ol>
    </div>

  );
};

export default MonthlyRanking;
