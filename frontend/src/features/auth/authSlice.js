import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const login = createAsyncThunk('auth/login', async ({ username, password }, thunkAPI) => {
    try {
        const response = await api.post('/login', { username, password });
        const { token } = response.data;
        localStorage.setItem('token', token);
        return token;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            state.token = null;
            state.error = null;
            state.loading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
