// Firebase connection for Diamondhead. Keep this file beside index.html.
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBwKXYJji4qQNoOvhcqpdBWHdpPLQ4sXJ0",
    authDomain: "tarsaray1.firebaseapp.com",
    databaseURL: "https://tarsaray1-default-rtdb.firebaseio.com",
    projectId: "tarsaray1",
    storageBucket: "tarsaray1.firebasestorage.app",
    messagingSenderId: "782765725846",
    appId: "1:782765725846:web:d645224c9942a0075acab7"
  };
  if (!window.firebase) { console.error("Firebase SDK failed to load."); return; }
  const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
  window.firebaseApp = app;
  window.firebaseAuth = app.auth();
  window.firebaseDb = app.database();
})();