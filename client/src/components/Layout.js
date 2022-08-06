import React, { useContext } from 'react';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const { authenticated, handleLogout } = useContext(AuthContext);

  const renderUILinks = () => {
    if (authenticated) {
      return (
        <Button onClick={() => handleLogout(navigate)}>Logout</Button>
      )
    } else {
      return (
        <Nav.Link eventKey="/login">Login</Nav.Link>
      )
    };
  };

  const handleSelect = (eventKey) => {
    navigate(eventKey)
  };

  return (
    <>
      <Navbar expand="md" bg="dark" variant="dark">
        <Container>
          <Navbar.Brand style={{ cursor: 'pointer' }} onClick={() => navigate("/")}>EarlyDay</Navbar.Brand>
          <Navbar.Toggle aria-controls="response-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto" onSelect={handleSelect}>
              <Nav.Link as={NavLink} to="/" >Home</Nav.Link>
              <Nav.Link as={NavLink} to="/applications" >Applications</Nav.Link>
            </Nav>
            <Nav className="justify-content-end" onSelect={handleSelect}>
              {renderUILinks()}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet />
      <Container className="mt-3">
        {children}
      </Container>
    </>
  );
};

export default Layout;