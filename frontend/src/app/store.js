import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import permissionsReducer from '../features/permissions/permissionsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        permissions: permissionsReducer,
    },
});

export default store;
