import { db } from "../firebase";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

// 訪問済みか判定
export const isVisited = async (uid, shopId) => {
  const docRef = doc(db, "users", uid, "visited", shopId);
  const snap = await getDoc(docRef);
  return snap.exists();
};

// 訪問済みトグル（登録・解除）
export const toggleVisited = async (uid, shop) => {
  const docRef = doc(db, "users", uid, "visited", shop.id);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    // すでに存在する場合は削除
    await deleteDoc(docRef);
    return false; // 削除された
  } else {
    // 新規作成：visitedAt に現在時刻を自動設定
    await setDoc(docRef, {
      name: shop.name,
      address: shop.address,
      genre: shop.genre,
      visitedAt: serverTimestamp(), // ← ここを自動タイムスタンプに
    });
    return true; // 追加された
  }
};
