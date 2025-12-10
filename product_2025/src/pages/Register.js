import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './Register.scss';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        displayName: user.displayName || '',
        email: user.email,
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      showMessage('登録完了しました。ログインしてください。', 'success');
    } catch (error) {
      showMessage('登録失敗: ' + error.message, 'error');
    }
  };

  return (
    <div className="register-page">
      <h2>新規登録</h2>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <input
        type="email"
        placeholder="メールアドレス"
        className="inputArea"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="パスワード"
        className="inputArea"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="register-btn" onClick={handleRegister}>登録する</button>

      <hr />

      <div className="login-link">
        すでにアカウントをお持ちですか？ <Link to="/login">ログインはこちら</Link>
      </div>
    </div>
  );
};

export default Register;
