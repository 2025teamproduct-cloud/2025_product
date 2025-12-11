"use client";
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, GeoPoint } from "firebase/firestore";
import './AdminForm.scss';

// 地理院APIで住所から緯度経度を取得
async function getLatLngFromAddress(address) {
  try {
    const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(address)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.length > 0) {
      const [lng, lat] = data[0].geometry.coordinates;
      return { lat, lng };
    }
    return null;
  } catch (err) {
    console.error("住所検索エラー:", err);
    return null;
  }
}

export default function AdminForm() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    genre: "",
    priceRange: "",
    station: "",
  });

  // 営業時間を配列で管理
  const [businessHours, setBusinessHours] = useState([
    { label: "ランチ", open: "", close: "" },
  ]);

  const [message, setMessage] = useState("");

  // 通常のフォーム変更
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 営業時間変更
  const handleHoursChange = (index, field, value) => {
    const newHours = [...businessHours];
    newHours[index][field] = value;
    setBusinessHours(newHours);
  };

  // 営業時間追加
  const addBusinessHour = () => {
    setBusinessHours([...businessHours, { label: "", open: "", close: "" }]);
  };

  // 営業時間削除
  const removeBusinessHour = (index) => {
    const newHours = businessHours.filter((_, i) => i !== index);
    setBusinessHours(newHours);
  };

  // フォーム送信
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const latlng = await getLatLngFromAddress(form.address);
      if (!latlng) {
        throw new Error("住所から位置情報を取得できませんでした。");
      }

      await addDoc(collection(db, "shops"), {
        ...form,
        businessHours: businessHours.map((h) => ({
          label: h.label || "営業時間",
          open: parseInt(h.open) || 0,
          close: parseInt(h.close) || 0,
        })),
        LatLng: new GeoPoint(latlng.lat, latlng.lng),
        createdAt: serverTimestamp(),
      });

      setMessage("店舗を登録しました！");
      setForm({
        name: "",
        address: "",
        genre: "",
        priceRange: "",
        station: "",
      });
      setBusinessHours([{ label: "ランチ", open: "", close: "" }]);
    } catch (err) {
      console.error(err);
      setMessage("登録に失敗しました: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} >
      <h2>店舗追加フォーム</h2>

      <fieldset className="desc">
        <legend>基本情報</legend>
        <div className="addForm">
        <input
          name="name"
          placeholder="店名"
          value={form.name}
          onChange={handleChange}
          required
        />
        </div>
        <div className="addForm">
        <input
          name="address"
          placeholder="住所"
          value={form.address}
          onChange={handleChange}
          required
        />
        </div>
        <div className="addForm">
        <input
          name="genre"
          placeholder="ジャンル"
          value={form.genre}
          onChange={handleChange}
        />
        </div>
        <div className="addForm">
        <input
          name="priceRange"
          placeholder="価格帯 (例: 800-2000)"
          value={form.priceRange}
          onChange={handleChange}
        />
        </div>
        <div className="addForm">
        <input
          name="station"
          placeholder="最寄駅"
          value={form.station}
          onChange={handleChange}
        />
        </div>
      </fieldset>

      <fieldset className="hours-list">
        <legend>営業時間</legend>
        {businessHours.map((h, index) => (
          <div key={index} className="hours-item">
            <input
              placeholder="ラベル (例: ランチ)"
              value={h.label}
              onChange={(e) => handleHoursChange(index, "label", e.target.value)}
            />
            <input
              placeholder="開店時間 (例: 1100)"
              value={h.open}
              onChange={(e) => handleHoursChange(index, "open", e.target.value)}
            />
            <input
              placeholder="閉店時間 (例: 1500)"
              value={h.close}
              onChange={(e) => handleHoursChange(index, "close", e.target.value)}
            />
            <button type="button" className="btn-remove" onClick={() => removeBusinessHour(index)}>削除</button>
          </div>
        ))}
        <button type="button" className="btn-add" onClick={addBusinessHour}>+ 営業時間追加</button>
      </fieldset>

      <button type="submit">送信</button>

      {message && <p className="message">{message}</p>}
    </form>


  );
}
