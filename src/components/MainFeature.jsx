import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { setTasks, addTask, editTask, removeTask } from '../store/taskSlice';
import { getIcon } from '../utils/iconUtils';

// Icons
const PlusIcon = getIcon('Plus');
const TrashIcon = getIcon('Trash2');
const EditIcon = getIcon('Edit');
const ClockIcon = getIcon('Clock');
const CheckIcon = getIcon('Check');
const XIcon = getIcon('X');
const AlertCircleIcon = getIcon('AlertCircle');
const InfoIcon = getIcon('Info');
const ArrowUpIcon = getIcon('ArrowUp');
const ArrowDownIcon = getIcon('ArrowDown');
const CheckCircleIcon = getIcon('CheckCircle');
const CircleIcon = getIcon('Circle');
const TagIcon = getIcon('Tag');

function MainFeature({ onTaskChange }) {
  const dispatch = useDispatch();
  const { tasks } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.user);
  
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'not-started',
    Tags: []
  });
  const [editingTask, setEditingTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortField, setSortField] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filter, setFilter] = useState('all');
  
  // Initial data loading
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const result = await fetchTasks();
        dispatch(setTasks(result));
        if (onTaskChange) onTaskChange();
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [dispatch, onTaskChange]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingTask(prev => ({ ...prev, [name]: value }));
    } else {
      setNewTask(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    
    // Validate form fields
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    
    try {
      setLoadingAction(true);
      const taskData = {
        Name: newTask.title,
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        status: newTask.status,
        Tags: newTask.Tags.join(',')
      };
      
      const createdTask = await createTask(taskData);
      
      dispatch(addTask(createdTask));
      if (onTaskChange) onTaskChange();
      
      // Reset form
      setNewTask({
      title: newTask.title,
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'not-started',
        Tags: []
      });
      
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEditTask = (task) => {
    // Transform database task to form format
    setEditingTask({
      Id: task.Id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      Tags: task.Tags?.split(',') || []
    });
    setIsEditing(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    
    // Validate form fields
    if (!editingTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    
    try {
      setLoadingAction(true);
      const taskData = {
        Id: editingTask.Id,
        Name: editingTask.title,
        title: editingTask.title,
        description: editingTask.description,
        dueDate: editingTask.dueDate,
        priority: editingTask.priority,
        status: editingTask.status,
        Tags: Array.isArray(editingTask.Tags) ? editingTask.Tags.join(',') : editingTask.Tags
      };
      
      const updatedTask = await updateTask(taskData);
      
      dispatch(editTask(updatedTask));
      if (onTaskChange) onTaskChange();
      
      setIsEditing(false);
      setEditingTask(null);
      
    toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this task?');
    if (confirmDelete) {
      try {
        setLoadingAction(true);
        await deleteTask(id);
        
        dispatch(removeTask(id));
        if (onTaskChange) onTaskChange();
        
        toast.success('Task deleted successfully');
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoadingAction(true);
      
      // Find the task to update
      const taskToUpdate = tasks.find(task => task.Id === id);
      if (!taskToUpdate) {
        throw new Error('Task not found');
      }
      
      // Update the task status
      const updatedTaskData = {
        ...taskToUpdate,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null
      };
      
      const updatedTask = await updateTask(updatedTaskData);
      dispatch(editTask(updatedTask));
      if (onTaskChange) onTaskChange();
      
      toast.success(`Task marked as ${newStatus.replace('-', ' ')}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = [...tasks]
    .filter(task => {
      if (filter === 'all') return true;
      return task.status === filter;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle date comparison
      if (sortField === 'dueDate' && aValue && bValue) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // Handle text comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      // Handle number or date comparison
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Determine style for priority badge
  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400';
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Determine style for status badge
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'not-started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Check if a task is overdue
  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    return new Date(task.dueDate) < new Date();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
          <TagIcon className="w-5 h-5 mr-2 text-primary" />
          My Tasks
        </h2>
        
        {/* Task Form */}
        <form 
          className="card mb-6"
          onSubmit={isEditing ? handleUpdateTask : handleAddTask}
        >
        <div className="relative">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? 'Edit Task' : 'Add New Task'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="title">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={isEditing ? editingTask.title : newTask.title}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter task title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="dueDate">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={isEditing ? editingTask.dueDate : newTask.dueDate}
                onChange={handleInputChange}
                className="input"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={isEditing ? editingTask.description : newTask.description}
              onChange={handleInputChange}
              className="input min-h-[100px]"
              placeholder="Enter task description"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={isEditing ? editingTask.priority : newTask.priority}
                onChange={handleInputChange}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={isEditing ? editingTask.status : newTask.status}
                onChange={handleInputChange}
                className="input"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
              {isEditing && (
                <button
                type="button"
                onClick={handleCancelEdit}
                className="btn bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
            >
              {isEditing ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    {loadingAction ? 'Updating...' : 'Update Task'}
                  </>
              ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    {loadingAction ? 'Adding...' : 'Add Task'}
                  </>
                )}
                </>
              )}
            </button>
          
          {/* Loading overlay */}
          {loadingAction && (
            <div className="absolute inset-0 bg-white/50 dark:bg-surface-800/50 flex items-center justify-center rounded-xl">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          </div>
        </form>
        
        {/* Task Filters and Controls */}
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`btn ${filter === 'all' ? 'btn-primary' : 'bg-surface-200 dark:bg-surface-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('not-started')}
              className={`btn ${filter === 'not-started' ? 'btn-primary' : 'bg-surface-200 dark:bg-surface-700'}`}
            >
              Not Started
            </button>
            <button
              onClick={() => setFilter('in-progress')}
              className={`btn ${filter === 'in-progress' ? 'btn-primary' : 'bg-surface-200 dark:bg-surface-700'}`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`btn ${filter === 'completed' ? 'btn-primary' : 'bg-surface-200 dark:bg-surface-700'}`}
            >
              Completed
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-surface-600 dark:text-surface-400">Sort by:</span>
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortField(field);
                setSortDirection(direction);
              }}
              className="input py-1 px-3"
            >
              <option value="dueDate-asc">Due Date (Earliest)</option>
              <option value="dueDate-desc">Due Date (Latest)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="priority-desc">Priority (Highest)</option>
              <option value="priority-asc">Priority (Lowest)</option>
            </select>
          </div>
        </div>
        
        {/* Task List */}
        <div className="space-y-4">
          {filteredAndSortedTasks.length === 0 ? (
            <div className="card text-center py-10">
              <InfoIcon className="w-12 h-12 mx-auto mb-4 text-surface-400" />
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="text-surface-500 dark:text-surface-400">
                {filter === 'all' 
                  ? "You haven't added any tasks yet. Get started by adding your first task!" 
                  : `You don't have any ${filter.replace('-', ' ')} tasks.`}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredAndSortedTasks.map((task) => (
                  <motion.div
                    key={task.Id}
                    className={`card border-l-4 ${
                      isOverdue(task)
                        ? 'border-red-500'
                        : task.status === 'completed'
                        ? 'border-green-500'
                        : 'border-primary'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                      <div className="flex items-center">
                      <button
                        onClick={() => 
                          handleStatusChange(
                            task.Id, 
                            task.status === 'completed' ? 'not-started' : 'completed'
                          )
                        }
                        className="mr-3 text-surface-500 hover:text-primary transition-colors"
                        aria-label={task.status === 'completed' ? "Mark as not started" : "Mark as completed"}
                      >
                        {task.status === 'completed' ? (
                          <CheckCircleIcon className="w-6 h-6 text-green-500" />
                        ) : (
                          <CircleIcon className="w-6 h-6" />
                        )}
                      </button>
                      
                      <h3 className={`font-medium text-lg ${
                        task.status === 'completed' ? 'line-through text-surface-500' : ''
                      }`}>
                        {task.title}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 md:ml-auto">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeStyle(task.status)}`}>
                        {task.status.replace('-', ' ')}
                      </span>
                      
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadgeStyle(task.priority)}`}>
                        {task.priority}
                      </span>
                      
                      {task.dueDate && (
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center ${
                          isOverdue(task) 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400' 
                            : 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300'
                        }`}>
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {formatDate(task.dueDate)}
                          {isOverdue(task) && (
                            <AlertCircleIcon className="w-3 h-3 ml-1 text-red-500" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-surface-600 dark:text-surface-400 mb-4 text-sm">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="btn bg-surface-200 hover:bg-surface-300 dark:bg-surface-700 dark:hover:bg-surface-600 px-3 py-1 flex items-center gap-1 disabled:opacity-50"
                      disabled={loadingAction}
                    >
                      <EditIcon className="w-4 h-4" />
                      <span className="sm:inline">Edit</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTask(task.Id)}
                      className="btn bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 px-3 py-1 flex items-center gap-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="sm:inline">Delete</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>
    </div>
  );
}

export default MainFeature;