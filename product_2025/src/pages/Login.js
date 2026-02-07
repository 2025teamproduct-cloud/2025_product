// Login.js
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Login.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const navigate = useNavigate();

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage('ログイン成功！', 'success');
      setTimeout(() => navigate('/home'), 1000);
    } catch (error) {
      showMessage('アカウントが存在しないか、メールアドレスまたはパスワードが間違っています', 'error');
    }
  };


  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, 'users', user.uid);

      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        // 👇 初回ログイン時のみ Firestore に登録
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log('✅ Firestore に新規ユーザー登録');
      } else {
        // 👇 既存ユーザーなら updatedAt だけ更新
        await setDoc(
          userRef,
          { updatedAt: serverTimestamp() },
          { merge: true }
        );
        console.log('🔄 既存ユーザーの更新');
      }

      navigate('/home');
    } catch (error) {
      console.error('❌ Googleログイン失敗:', error);
      showMessage('Googleログインに失敗しました');
    }
  };


  return (
    <div className="login-page">
      <h2>ログイン</h2>

      {/* メッセージ表示エリア */}
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <input
        className="inputArea"
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="inputArea"
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {/* ★変更点：ボタンにクラスを追加 */}
      <button className="btn email-login" onClick={handleEmailLogin}>
        ログイン
      </button>

      <hr />

      {/* ★変更点：Google 用の別クラスを追加 */}
      <button className="btn google-login" onClick={handleGoogleLogin}>
        Googleでログイン
      </button>

      <p>
        アカウントがない？ <a href="/register">登録する</a>
      </p>
    </div>
  );
};

export default Login;
