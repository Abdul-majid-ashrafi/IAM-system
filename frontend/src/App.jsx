import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Groups from './pages/Groups';
import Roles from './pages/Roles';
import Modules from './pages/Modules';
import Permissions from './pages/Permissions';
import Nav from './pages/Nav';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchPermissions } from './features/permissions/permissionsSlice';


export default function App() {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const isLoggedIn = !!token;

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchPermissions());
    }
  }, [isLoggedIn, dispatch]);

  return (
    <Router>
      {isLoggedIn && <Nav />}

      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/users" element={isLoggedIn ? <Users /> : <Navigate to="/login" />} />
        <Route path="/groups" element={isLoggedIn ? <Groups /> : <Navigate to="/login" />} />
        <Route path="/roles" element={isLoggedIn ? <Roles /> : <Navigate to="/login" />} />
        <Route path="/modules" element={isLoggedIn ? <Modules /> : <Navigate to="/login" />} />
        <Route path="/permissions" element={isLoggedIn ? <Permissions /> : <Navigate to="/login" />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </Router>
  );
}
