import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useState } from "react";
import "./App.css";
import { NextUIProvider } from "@nextui-org/react";
import NavigationBar from "./components/navbar";
import Home from "./components/Home";
import FindGroup from "./components/FindGroup";
import CreateGroup from "./components/CreateGroup";
import Authentication from "./components/Authentication";
import PrivateRoute from "./PrivateRoute";
import ManagedGroups from "./components/managedGroups";
import MessagesPage from "./components/messaging/MessagesPage";
function App() {
  return (
    <NextUIProvider>
      <Router>
        <Content />
      </Router>
    </NextUIProvider>
  );
}

function Content() {
  const location = useLocation();

  // Do not show the navbar on the login page
  const showNavbar = location.pathname !== "/login";

  return (
    <>
      {showNavbar && <NavigationBar />}
      <Routes>
        <Route path="/" element={<PrivateRoute element={<Home />} />} />
        <Route path="/login" element={<Authentication />} />
        <Route
          path="/find-group"
          element={<PrivateRoute element={<FindGroup />} />}
        />
        <Route
          path="/messages"
          element={<PrivateRoute element={<MessagesPage />} />}
        />
        <Route
          path="/create-group"
          element={<PrivateRoute element={<CreateGroup />} />}
        />
        <Route
          path="/managed-groups"
          element={<PrivateRoute element={<ManagedGroups />} />}
        />
      </Routes>
    </>
  );
}

export default App;