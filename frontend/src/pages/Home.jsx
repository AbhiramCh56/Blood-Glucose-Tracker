import { Link } from "react-router-dom";
import { HeartPulse, Droplets, CalendarDays, TrendingUp } from "lucide-react";

function Home() {
  return (
    <div className="home-page">
      <header className="dashboard-header">
        <div>
          <h1>Sweety</h1>
          <p>Your Blood Glucose Tracker</p>
        </div>

        <div className="home-header-actions">
          <Link className="home-link" to="/login">
            Sign in
          </Link>
          <Link className="home-link home-link-primary" to="/register">
            Get started
          </Link>
        </div>
      </header>

      <main className="home-content">
        <section className="home-hero">
          <div className="brand-icon">
            <HeartPulse size={30} />
          </div>

          <h1>Your health, one reading at a time.</h1>

          <p>
            Record your daily glucose readings, keep them organised, and see
            clear reports that help you understand your progress over time.
          </p>

          <div className="home-actions">
            <Link className="auth-button home-button" to="/register">
              Create a free account
            </Link>
            <Link className="home-secondary" to="/login">
              I already have an account
            </Link>
          </div>
        </section>

        <section className="home-features">
          <div className="dashboard-section home-feature">
            <Droplets className="home-feature-icon" size={22} />
            <h2>Log your readings</h2>
            <p>
              Track morning fasting, after breakfast, after lunch, and after
              dinner in one place.
            </p>
          </div>

          <div className="dashboard-section home-feature">
            <CalendarDays className="home-feature-icon" size={22} />
            <h2>Stay consistent</h2>
            <p>
              Keep a simple daily record of your glucose values and build a
              habit that lasts.
            </p>
          </div>

          <div className="dashboard-section home-feature">
            <TrendingUp className="home-feature-icon" size={22} />
            <h2>See the bigger picture</h2>
            <p>
              Daily, month-to-date, and previous-month reports show your
              highest, lowest, and average values.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
