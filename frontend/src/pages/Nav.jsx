import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { clearPermissions } from '../features/permissions/permissionsSlice';

const Nav = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearPermissions());
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`;

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-6">
            <div className="text-xl font-bold">IAM Portal</div>

            <div className="flex items-center space-x-1">
              <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/modules" className={linkClass}>Modules</NavLink>
              <NavLink to="/permissions" className={linkClass}>Permissions</NavLink>
              <NavLink to="/roles" className={linkClass}>Roles</NavLink>
              <NavLink to="/groups" className={linkClass}>Groups</NavLink>
              <NavLink to="/users" className={linkClass}>Users</NavLink>
            </div>
          </div>

          <div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
