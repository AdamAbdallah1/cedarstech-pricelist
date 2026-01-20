import { db } from "../firebase.js";
import { collection, getDocs } from "firebase/firestore";

async function test() {
  const colRef = collection(db, "services");
  const snapshot = await getDocs(colRef);
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}

test();
