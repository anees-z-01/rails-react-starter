import { Link } from 'react-router';

const NotFound = () => (
  <section className="page__intro">
    <h1>Page not found</h1>
    <p>That address doesn&apos;t match anything on the board. <Link to="/">Back to all roles</Link></p>
  </section>
);

export default NotFound;
