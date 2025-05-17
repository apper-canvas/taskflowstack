import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  loading: false,
  error: null,
};

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
      state.loading = false;
      state.error = null;
    },
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    editTask: (state, action) => {
      const index = state.tasks.findIndex(task => task.Id === action.payload.Id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    removeTask: (state, action) => {
      state.tasks = state.tasks.filter(task => task.Id !== action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
});

export const { setTasks, addTask, editTask, removeTask, setError } = taskSlice.actions;
export default taskSlice.reducer;