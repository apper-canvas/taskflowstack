import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import MainFeature from '../components/MainFeature';
import { getIcon } from '../utils/iconUtils';

const CheckCircleIcon = getIcon('CheckCircle');
const BarChartIcon = getIcon('BarChart');
const ClockIcon = getIcon('Clock');
const TagIcon = getIcon('Tag');

function Home() {
  const [stats, setStats] = useState({
    completed: 0,
    inProgress: 0,
    overdue: 0,
    total: 0
  });

  useEffect(() => {
    // Calculate stats based on tasks
    const calculateStats = () => {
      const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      
      const completed = storedTasks.filter(task => task.status === 'completed').length;
      const inProgress = storedTasks.filter(task => task.status === 'in-progress').length;
      const overdue = storedTasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return task.status !== 'completed' && dueDate < new Date();
      }).length;
      
      setStats({
        completed,
        inProgress,
        overdue,
        total: storedTasks.length
      });
    };

    calculateStats();
    
    // Set up event listener for task changes
    window.addEventListener('tasksUpdated', calculateStats);
    
    return () => {
      window.removeEventListener('tasksUpdated', calculateStats);
    };
  }, []);

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.total,
      icon: TagIcon,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: BarChartIcon,
      color: "text-primary",
      bgColor: "bg-primary/10 dark:bg-primary/20"
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircleIcon,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30"
    },
    {
      title: "Overdue",
      value: stats.overdue,
      icon: ClockIcon,
      color: "text-secondary",
      bgColor: "bg-secondary/10 dark:bg-secondary/20"
    }
  ];

  return (
    <div className="space-y-8">
      <section>
        <motion.h1 
          className="text-2xl md:text-3xl font-bold mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to TaskFlow
        </motion.h1>
        <p className="text-surface-600 dark:text-surface-400">
          Efficiently organize and manage your tasks with our intuitive task management system.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Your Task Dashboard</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              className="card flex flex-col items-center p-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className={`p-3 rounded-full ${stat.bgColor} mb-3`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-surface-500 dark:text-surface-400 text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <MainFeature onTaskChange={() => {
          const event = new Event('tasksUpdated');
          window.dispatchEvent(event);
        }} />
      </section>
    </div>
  );
}

export default Home;