import { Route, Routes } from 'react-router-dom';

import './App.css';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Applications from './pages/Applications';
import Home from './pages/Home';
import Job from './pages/Job';
import Login from './pages/Login';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route path="/applications" element={<Applications />} />
          <Route path="/jobs/:slug" element={<Job />} />
        </Route>
      </Routes>
    </Layout>
  );
}

export default App;
