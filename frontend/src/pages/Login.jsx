import { useState } from "react";
import { Link } from "react-router-dom";
import { HeartPulse, Mail, Lock, Eye, EyeOff } from "lucide-react";

function Login() {
  // Store the values entered by the user
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Control password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Email:", email);
    console.log("Password entered:", Boolean(password));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">
            <HeartPulse size={30} />
          </div>
          <h1>Sweety</h1>
          <p>Your health, one reading at a time.</p>
        </div>

        <div className="auth-heading">
          <h2>Welcome back!</h2>
          <p>Sign in to continue tracking your glucose.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>

            <div className="input-wrapper">
              <Mail size={19} />

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <div className="input-wrapper">
              <Lock size={19} />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button">
            Sign In
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
