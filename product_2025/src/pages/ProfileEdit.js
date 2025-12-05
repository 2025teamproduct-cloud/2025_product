import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { updateProfile, updateEmail } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import './ProfileEdit.scss';

const ProfileEdit = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setMessage("");
    setError("");

    try {
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName,
        email,
        updatedAt: serverTimestamp(),
      });

      setMessage("プロフィールを更新しました！");
      setTimeout(() => navigate("/mypage"), 1000);
    } catch (err) {
      setError("更新エラー: " + err.message);
    }
  };

  if (!user) return <p>ログインしてください。</p>;

  return (
    <div className="profile-edit-page">
      <h2>プロフィール編集</h2>
      {message && <div className="message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>表示名:</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>メールアドレス:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button className="btn-save" onClick={handleSave}>保存</button>
    </div>
  );
};

export default ProfileEdit;
