import { useState, useEffect } from "react";

import "../App.css";
import "../css/authentication.css";
import { doSignInWithEmailAndPassword, doSignOut } from "../firebase/auth";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
function Authentication() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();
  function setEmailFunction(e) {
    setEmail(e.target.value);
  }
  function setPasswordFunction(e) {
    setPassword(e.target.value);
  }

  useEffect(() => {
    if (userLoggedIn) {
      navigate("/"); // Redirect to /home if user is logged in
    }
  }, [userLoggedIn, navigate]);
  const logIn = async (e) => {
    if (!userLoggedIn) {
      await doSignInWithEmailAndPassword(email, password);
    }
  };

  return (
    <>
      {userLoggedIn ? (
        <div>
          <p className="sign-out-button" onClick={doSignOut}>
            Sign out
          </p>
        </div>
      ) : (
        <>
          {/* <p>B09HW89YYQ</p> */}
          <div className="header"></div>
          <div className="logIn-form">
            <h3 className="logIn-header">Login</h3>
            <p className="logIn-label">Login to use chrome extension</p>
            <p className="email-input-label">Email Address</p>
            <input
              className="email-input"
              type="text"
              placeholder="Enter email"
              onChange={setEmailFunction}
            />
            <p className="password-input-label">Password</p>
            <input
              className="password-input"
              type="text"
              placeholder="Enter password"
              onChange={setPasswordFunction}
            />
            <p className="forgot-password-label">Forgot password</p>
            <button className="logIn-button" onClick={logIn}>
              Login
            </button>
            <p className="signUp-label">
              Don't have an account? <span>Sign up</span>
            </p>
          </div>
        </>
      )}
    </>
  );
}

export default Authentication;
