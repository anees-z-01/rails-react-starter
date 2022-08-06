import { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { AuthContext } from '../providers/AuthProvider';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { authenticated, user, isAdmin, signOut } = useContext(AuthContext);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="masthead">
        <div className="masthead__inner">
          <Link to="/" className="wordmark">Shortlist</Link>
          <nav aria-label="Main" className="masthead__nav">
            <NavLink to="/" end>Roles</NavLink>
            {authenticated && <NavLink to="/applications">My applications</NavLink>}
          </nav>
          <div className="masthead__account">
            {authenticated ? (
              <>
                <span className="masthead__user">
                  {user.email}
                  {isAdmin && <span className="masthead__role">admin</span>}
                </span>
                <button type="button" className="button button--ghost button--small"
                  onClick={() => signOut().then(() => navigate('/login'))}>
                  Sign out
                </button>
              </>
            ) : (
              <NavLink to="/login" className="button button--small">Sign in</NavLink>
            )}
          </div>
        </div>
      </header>
      <main id="main" className="page">{children}</main>
    </>
  );
};

export default Layout;
