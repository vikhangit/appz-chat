/* eslint-disable */
import { useEffect, useState } from "react";
import { auth } from "../utils/firebase";

export default function useToken() {
  const [user, setUser] = useState();
  const [token, setToken] = useState();
  const [loadingToken, setLoadingToken] = useState(true);

  useEffect(() => {
    auth.onAuthStateChanged((user: any) => { 
      if (user) {
        user
        .getIdToken(true)
        .then(async(token: any) => {
          setUser(user);
          setToken(token);
          setLoadingToken(false);
        });
      } else {
        setLoadingToken(false);
      }
    });
  }, [])

  return {token, loadingToken, user};
}
