import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Thunk to fetch current user's inherited permissions
export const fetchPermissions = createAsyncThunk(
    'permissions/fetchPermissions',
    async (_, thunkAPI) => {
        try {
            const res = await api.get('/access/me/permissions');
            return res.data.permissions || [];
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || { message: 'Failed to fetch permissions' });
        }
    }
);

const permissionsSlice = createSlice({
    name: 'permissions',
    initialState: {
        items: [], // array of {module, action}
        loading: false,
        error: null,
    },
    reducers: {
        clearPermissions: (state) => {
            state.items = [];
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPermissions.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to load permissions';
            });
    }
});

export const { clearPermissions } = permissionsSlice.actions;
export default permissionsSlice.reducer;
