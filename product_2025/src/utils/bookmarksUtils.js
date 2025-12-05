// src/utils/bookmarkUtils.js
import { db } from "../firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  collection,
  serverTimestamp,
} from "firebase/firestore";

/**
 * ブックマークを追加
 */
export const addBookmark = async (uid, shop) => {
  if (!uid || !shop?.id) return;
  const ref = doc(db, "users", uid, "bookmarks", shop.id);
  await setDoc(ref, {
    shopId: shop.id,
    name: shop.name,
    address: shop.address,
    genre: shop.genre,
    priceRange: shop.priceRange || null,
    station: shop.station || null,
    createdAt: serverTimestamp(),
  });
};

/**
 * ブックマークを削除
 */
export const removeBookmark = async (uid, shopId) => {
  if (!uid || !shopId) return;
  const ref = doc(db, "users", uid, "bookmarks", shopId);
  await deleteDoc(ref);
};

/**
 * その店がブックマーク済みかどうか判定
 */
export const isBookmarked = async (uid, shopId) => {
  if (!uid || !shopId) return false;
  const ref = doc(db, "users", uid, "bookmarks", shopId);
  const snap = await getDoc(ref);
  return snap.exists();
};

/**
 * トグル（登録・削除を切り替え）
 */
export const toggleBookmark = async (uid, shop) => {
  const bookmarked = await isBookmarked(uid, shop.id);
  if (bookmarked) {
    await removeBookmark(uid, shop.id);
    return false; // 削除後はfalse
  } else {
    await addBookmark(uid, shop);
    return true; // 登録後はtrue
  }
};

/**
 * 現在のユーザーの全ブックマーク取得
 */
export const getUserBookmarks = async (uid) => {
  if (!uid) return [];
  const colRef = collection(db, "users", uid, "bookmarks");
  const snap = await getDocs(colRef);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
