import { onAuthStateChanged, signOut } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  doc,
} from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", content: "" });

  // ✅ Track authentication state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // ✅ Sign in with Google
  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  // ✅ Sign out
  const signOutNow = async () => {
    await signOut(auth);
  };

  // ✅ Fetch notes when user is logged in
  useEffect(() => {
    if (!user) {
      setNotes([]); // clear notes when logged out
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(collection(db, "notes"), where("uid", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setNotes(data);
        setLoading(false);
      },
      (err) => {
        console.log(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // ✅ Create new note
  const createNote = async (e) => {
    e.preventDefault();
    if (!user) return;

    const { title, content } = form;

    try {
      await addDoc(collection(db, "notes"), {
        uid: user.uid,
        title,
        content,
        createdAt: serverTimestamp(), // 🔥 fixed typo: createAt → createdAt
      });
      setForm({ title: "", content: "" });
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ Delete note
  const removeNote = async (id) => {
    try {
      await deleteDoc(doc(db, "notes", id));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h1>Firebase Notes</h1>

      {/* ✅ User Info / Auth */}
      {user ? (
        <div>
          <p>
            Signed in as {user.displayName} ({user.email})
          </p>
          <button onClick={signOutNow}>Sign out</button>
        </div>
      ) : (
        <button onClick={signIn}>Sign In with Google</button>
      )}

      {/* ✅ Note Form */}
      {user && (
        <section>
          <h2>Create a note!</h2>
          <form onSubmit={createNote}>
            <div>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Title"
              />
            </div>
            <div>
              <textarea
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="Write your note..."
              />
            </div>
            <button type="submit">Add note</button>
          </form>
        </section>
      )}

      {/* ✅ Notes List */}
      <section>
        <h2>Your Notes</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {notes.map((n) => (
              <li key={n.id}>
                <div>{n.title}</div>
                <button onClick={() => removeNote(n.id)}>Delete</button>
                <p>{n.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
