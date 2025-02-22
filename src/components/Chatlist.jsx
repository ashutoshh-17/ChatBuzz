import React, { useState, useMemo, useEffect } from 'react'
import defaultAvatar from "../assets/default.jpg"
import { RiMore2Fill } from "react-icons/ri";
import SearchModel from './SearchModal';
import chatData from "../data/chats";
import { formatTimestamp } from "../utils/formatTimestamp";
import { auth, db, listenForChats } from "../firebase/firebase";
import { doc, onSnapshot } from 'firebase/firestore';


const Chatlist = ({ setSelectedUser }) => {
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userDocRef = doc(db, "users", auth?.currentUser?.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      setUser(doc.data());
    })
    return unsubscribe;
  }, []);

  useEffect(() => {
      // Call `listenForChats` and pass `setChats` to update the chat list in real-time
      // `listenForChats` is expected to be a function that listens to Firestore database changes
      const unsubscribe = listenForChats(setChats);

      // Cleanup function: This ensures that when the component unmounts, we stop listening for chat updates
      return () => {
          unsubscribe();
      };
  }, []); // The empty dependency array ensures this effect runs only once when the component mounts

  const sortedChats = useMemo(() => {
      // useMemo is used to optimize performance by memoizing (caching) the sorted chats.
      // This means it only recalculates when `chats` changes instead of sorting on every render.

      return [...chats].sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
      // Creates a copy of the `chats` array using the spread operator (`[...]`)
      // Sorts the copied array based on the `lastMessageTimestamp` (most recent first)
      // `b - a` ensures descending order, meaning the newest messages appear first.
  }, [chats]);
  // This memoized value updates only when the `chats` array changes to avoid unnecessary re-sorting.

  // useEffect(() => {
  //     const unsubscribe = onAuthStateChanged(auth, async (user) => {
  //         if (user) {
  //             const userDocRef = doc(db, "users", user.uid);
  //             const userDocSnap = await getDoc(userDocRef);

  //             if (userDocSnap.exists()) {
  //                 setUser(userDocSnap.data());
  //             } else {
  //                 console.error("User document not found");
  //             }
  //         } else {
  //             setUser(null);
  //         }
  //     });

  //     return () => unsubscribe();
  // }, []);

  const startChat = (user) => {
      setSelectedUser(user);
  };

  return (
      <section className="relative hidden lg:flex flex-col items-start justify-start bg-[#fff] h-[100vh] w-[100%] md:w-[600px] ">
          <header className="flex items-center justify-between w-[100%] border-b border-b-1 p-4 sticky md:static top-0 z-[100]">
              <main className="flex items-center gap-3">
                  <img className="h-[44px] w-[44px] object-cover rounded-full" src={user?.image || defaultAvatar} />
                  <span>
                      <h3 className="p-0 font-semibold text-[#2A3D39] md:text-[17px]">{user?.fullName || "ChatBuzz User"}</h3>
                      <p className="p-0 font-light text-[#2A3D39] text-[15px]">@{user?.username || "chatbuzz"}</p>
                  </span>
              </main>
              <button className="bg-[#D9F2ED] w-[35px] h-[35px] p-2 flex items-center justify-center rounded-lg">
                  <RiMore2Fill color="#01AA85" className="w-[28px] h-[28px]" />
              </button>
          </header>

          <div className=" w-[100%] mt-[10px] px-5">
              <header className="flex items-center justify-between ">
                  <h3 className="text-[16px] ">Messages ({chats?.length || 0})</h3>
                  <SearchModel startChat={startChat} />
              </header>
          </div>

          <main className="flex flex-col items-start gap-6 w-[100%] mt-[1.5rem] pb-3 custom-scrollbar">
              {sortedChats.map((chat) => (
                  <a key={chat.uid} className="item flex items-start justify-between w-[100%] border-b border-b-1 border-red px-5 pb-2">
                      {chat?.users
                          ?.filter((user) => user.email !== auth.currentUser.email)
                          .map((user) => (
                              <>
                                  <div
                                      className="flex items-start gap-3"
                                      onClick={() => {
                                          startChat(user);
                                      }}
                                  >
                                      <img src={user?.image || defaultAvatar} alt={1} className="h-[40px] w-[40px rounded-full" />
                                      <span>
                                          <h2 className="p-0 font-semibold text-[#2A3D39] text-[17px]">{user?.fullName}</h2>
                                          <p className="p-0 font-light text-[#2A3D39] text-[14px]">{chat?.lastMessage?.slice(0, 35) || "No messages yet"}</p>
                                      </span>
                                  </div>

                                  <p className="p-0 font-regular text-gray-400 text-[11px]">{formatTimestamp(chat?.lastMessageTimestamp)}</p>
                              </>
                          ))}
                  </a>
              ))}
          </main>
      </section>
  );
};

export default Chatlist
