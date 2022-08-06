import { Route, Routes } from 'react-router';

import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Applications from './pages/Applications';
import Home from './pages/Home';
import Job from './pages/Job';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/jobs/:slug" element={<Job />} />
        <Route element={<RequireAuth />}>
          <Route path="/applications" element={<Applications />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;
