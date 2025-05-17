/**
 * Task service for data operations using ApperClient
 */

// Table name from provided JSON
const TABLE_NAME = 'task1';

// Fields from JSON with proper visibility handling
const UPDATEABLE_FIELDS = [
  'Name',
  'Tags',
  'Owner',
  'title',
  'description',
  'dueDate',
  'priority',
  'status',
  'completedAt'
];

const ALL_FIELDS = [
  ...UPDATEABLE_FIELDS,
  'CreatedOn',
  'CreatedBy',
  'ModifiedOn',
  'ModifiedBy'
];

/**
 * Fetch all tasks
 */
export const fetchTasks = async () => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      fields: ALL_FIELDS,
      orderBy: [
        {
          field: 'ModifiedOn',
          direction: 'desc'
        }
      ],
      pagingInfo: {
        limit: 100,
        offset: 0
      }
    };

    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    
    if (!response || !response.data || response.data.length === 0) {
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

/**
 * Fetch task stats (completed, in-progress, overdue, total)
 */
export const fetchTaskStats = async () => {
  try {
    const tasks = await fetchTasks();

    const completed = tasks.filter(task => task.status === 'completed').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const overdue = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return task.status !== 'completed' && dueDate < new Date();
    }).length;

    return {
      completed,
      inProgress,
      overdue,
      total: tasks.length
    };
  } catch (error) {
    console.error("Error fetching task stats:", error);
    throw error;
  }
};

/**
 * Create a new task
 */
export const createTask = async (taskData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Filter to include only updateable fields
    const filteredTaskData = Object.fromEntries(
      Object.entries(taskData).filter(([key]) => UPDATEABLE_FIELDS.includes(key))
    );

    const params = {
      records: [filteredTaskData]
    };

    const response = await apperClient.createRecord(TABLE_NAME, params);
    
    if (!response || !response.success || !response.results || response.results.length === 0) {
      throw new Error('Failed to create task');
    }
    
    const createdTask = response.results[0].data;
    return createdTask;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (taskData) => {
  try {
    if (!taskData.Id) {
      throw new Error('Task ID is required for update');
    }

    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Filter to include only updateable fields plus ID
    const filteredTaskData = { Id: taskData.Id };
    
    // Add updateable fields
    Object.entries(taskData).forEach(([key, value]) => {
      if (UPDATEABLE_FIELDS.includes(key)) {
        filteredTaskData[key] = value;
      }
    });

    const params = {
      records: [filteredTaskData]
    };

    const response = await apperClient.updateRecord(TABLE_NAME, params);
    
    if (!response || !response.success || !response.results || response.results.length === 0) {
      throw new Error('Failed to update task');
    }
    
    return response.results[0].data;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

/**
 * Delete a task by ID
 */
export const deleteTask = async (taskId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      RecordIds: [taskId]
    };

    const response = await apperClient.deleteRecord(TABLE_NAME, params);
    
    if (!response || !response.success) {
      throw new Error('Failed to delete task');
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};