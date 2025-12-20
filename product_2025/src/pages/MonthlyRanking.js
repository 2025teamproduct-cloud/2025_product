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

  // ★ 月切り替え用（1日に固定）
  const [currentMonth, setCurrentMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1) // 初期値を1日に設定
  );

  // ★ 開いているユーザー（1人だけ）
  const [openUserId, setOpenUserId] = useState(null);

  const toggleOpen = (userId) => {
    setOpenUserId((prev) => (prev === userId ? null : userId));
  };

  // ★ 月移動
  const changeMonth = (diff) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + diff, 1);
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      if (next > thisMonth) return prev; // 未来月の移動を禁止（必要に応じて削除）
      return next;
    });
  };

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const startDate = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          1,
          0,
          0,
          0
        );
        const endDate = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );

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
        setOpenUserId(null); // ★ 月変更時は閉じる
      } catch (err) {
        console.error("ランキング取得エラー:", err);
      }
      setLoading(false);
    };

    fetchRanking();
  }, [currentMonth]);

  if (loading) return <p>ランキングを読み込み中...</p>;
  if (ranking.length === 0)
    return <p>この月の訪問データがありません。</p>;

  // 同率順位用
  let lastRank = 0;
  let lastCount = null;

  return (
    <div className="ranking-container">
      {/* ★ 月切り替えヘッダー */}
      <h2 className="month-header">
        <button onClick={() => changeMonth(-1)}>◀</button>
        {currentMonth.getFullYear()}年
        {currentMonth.getMonth() + 1}月 の訪問ランキング
        <button onClick={() => changeMonth(1)}>▶</button>
      </h2>

      <ol className="ranking-list">
        {ranking.map((r, i) => {
          let rank;

          if (r.count === lastCount) {
            rank = lastRank;
          } else {
            rank = i + 1;
            lastRank = rank;
            lastCount = r.count;
          }

          const isOpen = openUserId === r.userId;

          return (
            <li key={r.userId} className="ranking-item">
              {/* ★ アコーディオン */}
              <div
                className="main-row"
                onClick={() => toggleOpen(r.userId)}
              >
                <span className="rank-num">{rank}位</span>

                <div className="name">{r.displayName} さん</div>

                <div className="right-box">
                  <div className="count">{r.count} 店舗</div>
                  <div className="toggle-icon">
                    {isOpen ? "▲" : "▼"}
                  </div>
                </div>
              </div>

              <ul className={`shop-list ${isOpen ? "open" : ""}`}>
                {r.shops.map((shop, idx) => (
                  <li key={idx}>{shop}</li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default MonthlyRanking;
