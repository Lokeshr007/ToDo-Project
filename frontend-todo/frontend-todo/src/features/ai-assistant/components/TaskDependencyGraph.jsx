import { useState, useEffect, useMemo } from 'react';
import {
  GitBranch,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Target,
  Info,
  Maximize2,
  Minimize2,
  Download,
  Filter
} from 'lucide-react';

function TaskDependencyGraph({ tasks, onTaskClick, onTaskHover, className = '' }) {
  const [dependencies, setDependencies] = useState({});
  const [criticalPath, setCriticalPath] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showLegend, setShowLegend] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, critical, dependencies

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      buildDependencyGraph();
      findCriticalPath();
    }
  }, [tasks]);

  const buildDependencyGraph = () => {
    const graph = {};
    const taskMap = {};

    // First pass: organize tasks by day
    tasks.forEach(task => {
      if (!graph[task.dayNumber]) {
        graph[task.dayNumber] = {
          tasks: [],
          dependsOn: new Set(),
          neededFor: new Set(),
          allDependencies: new Set(),
          allDependents: new Set()
        };
      }

      graph[task.dayNumber].tasks.push(task);
      taskMap[task.id || task.title] = task;
    });

    // Second pass: build dependency relationships
    tasks.forEach(task => {
      if (!graph[task.dayNumber]) return;

      // Add prerequisites
      if (task.prerequisites && task.prerequisites.length > 0) {
        task.prerequisites.forEach(prereq => {
          // Find task that covers this prerequisite
          const prereqTask = tasks.find(t => 
            t.title.toLowerCase().includes(prereq.toLowerCase()) ||
            t.category?.toLowerCase().includes(prereq.toLowerCase()) ||
            t.tags?.some(tag => tag.toLowerCase().includes(prereq.toLowerCase()))
          );

          if (prereqTask && prereqTask.dayNumber < task.dayNumber) {
            // Direct dependency
            graph[task.dayNumber].dependsOn.add(prereqTask.dayNumber);
            graph[task.dayNumber].allDependencies.add(prereqTask.dayNumber);
            
            if (!graph[prereqTask.dayNumber]) {
              graph[prereqTask.dayNumber] = { 
                tasks: [], 
                dependsOn: new Set(), 
                neededFor: new Set(),
                allDependencies: new Set(),
                allDependents: new Set()
              };
            }
            graph[prereqTask.dayNumber].neededFor.add(task.dayNumber);
            graph[prereqTask.dayNumber].allDependents.add(task.dayNumber);

            // Add transitive dependencies
            addTransitiveDependencies(graph, prereqTask.dayNumber, task.dayNumber);
          }
        });
      }

      // Add "builds upon" relationships (conceptual dependencies)
      if (task.buildsUpon && task.buildsUpon.length > 0) {
        task.buildsUpon.forEach(buildUpon => {
          const buildUponTask = tasks.find(t => 
            t.title.toLowerCase().includes(buildUpon.toLowerCase()) ||
            t.subject?.toLowerCase().includes(buildUpon.toLowerCase())
          );

          if (buildUponTask && buildUponTask.dayNumber < task.dayNumber) {
            graph[task.dayNumber].dependsOn.add(buildUponTask.dayNumber);
            graph[task.dayNumber].allDependencies.add(buildUponTask.dayNumber);
            
            if (!graph[buildUponTask.dayNumber]) {
              graph[buildUponTask.dayNumber] = { 
                tasks: [], 
                dependsOn: new Set(), 
                neededFor: new Set(),
                allDependencies: new Set(),
                allDependents: new Set()
              };
            }
            graph[buildUponTask.dayNumber].neededFor.add(task.dayNumber);
            graph[buildUponTask.dayNumber].allDependents.add(task.dayNumber);
          }
        });
      }
    });

    setDependencies(graph);
  };

  const addTransitiveDependencies = (graph, fromDay, toDay) => {
    // Find all dependencies of fromDay and add them to toDay
    const fromNode = graph[fromDay];
    if (fromNode) {
      fromNode.allDependencies.forEach(depDay => {
        graph[toDay].allDependencies.add(depDay);
        if (graph[depDay]) {
          graph[depDay].allDependents.add(toDay);
        }
      });
    }
  };

  const findCriticalPath = () => {
    // Calculate longest path through dependency graph
    const days = Object.keys(dependencies).map(Number).sort((a, b) => a - b);
    const pathLengths = {};
    const nextDayMap = {};

    // Initialize
    days.forEach(day => {
      pathLengths[day] = 0;
      nextDayMap[day] = null;
    });

    // Dynamic programming to find longest path
    for (let i = days.length - 1; i >= 0; i--) {
      const day = days[i];
      const node = dependencies[day];
      
      if (node && node.neededFor.size > 0) {
        Array.from(node.neededFor).forEach(nextDay => {
          const pathThroughNext = 1 + pathLengths[nextDay];
          if (pathThroughNext > pathLengths[day]) {
            pathLengths[day] = pathThroughNext;
            nextDayMap[day] = nextDay;
          }
        });
      }
    }

    // Build critical path starting from earliest day with longest path
    let startDay = days[0];
    let maxLength = pathLengths[startDay];
    
    days.forEach(day => {
      if (pathLengths[day] > maxLength) {
        maxLength = pathLengths[day];
        startDay = day;
      }
    });

    const path = [];
    let currentDay = startDay;
    while (currentDay !== null) {
      path.push(currentDay);
      currentDay = nextDayMap[currentDay];
    }

    setCriticalPath(path);
  };

  const getNodeColor = (day) => {
    const node = dependencies[day];
    if (!node) return 'bg-slate-700/50 border-slate-600 text-slate-400';

    const tasks = node.tasks || [];
    const hasHighPriority = tasks.some(t => t.priority === 'HIGH' || t.priority === 'HIGHEST');
    const hasBlockers = tasks.some(t => t.status === 'BLOCKED');
    const isCompleted = tasks.every(t => t.status === 'COMPLETED');
    const isInProgress = tasks.some(t => t.status === 'IN_PROGRESS');
    const isCritical = criticalPath.includes(day);
    
    if (hasBlockers) return 'bg-red-500/20 border-red-500/50 text-red-400';
    if (isCompleted) return 'bg-green-500/20 border-green-500/50 text-green-400';
    if (isInProgress) return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
    if (isCritical) return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
    if (hasHighPriority) return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
    if (node.dependsOn.size > 0) return 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400';
    
    return 'bg-slate-700/50 border-slate-600 text-slate-400';
  };

  const getNodeSize = (day) => {
    const taskCount = dependencies[day]?.tasks.length || 0;
    if (taskCount > 3) return 'w-20 h-20';
    if (taskCount > 1) return 'w-16 h-16';
    return 'w-12 h-12';
  };

  const getFilteredDays = () => {
    const days = Object.keys(dependencies).map(Number).sort((a, b) => a - b);
    
    if (filterType === 'critical') {
      return days.filter(day => criticalPath.includes(day));
    }
    
    if (filterType === 'dependencies') {
      return days.filter(day => 
        dependencies[day]?.dependsOn.size > 0 || 
        dependencies[day]?.neededFor.size > 0
      );
    }
    
    return days;
  };

  const calculateNodePosition = (index, total) => {
    const baseX = 100 + (index * 120) * zoomLevel;
    const baseY = 150;
    
    // Add some vertical variation for visual interest
    const variation = Math.sin(index * 0.5) * 30;
    
    return { x: baseX, y: baseY + variation };
  };

  const handleNodeClick = (day) => {
    setSelectedNode(selectedNode === day ? null : day);
    const task = dependencies[day]?.tasks[0];
    if (task && onTaskClick) {
      onTaskClick(task);
    }
  };

  const exportGraph = () => {
    const graphData = {
      nodes: getFilteredDays().map(day => ({
        day,
        tasks: dependencies[day].tasks,
        dependsOn: Array.from(dependencies[day].dependsOn),
        neededFor: Array.from(dependencies[day].neededFor)
      })),
      criticalPath,
      metadata: {
        totalDays: Object.keys(dependencies).length,
        totalTasks: tasks.length,
        criticalPathLength: criticalPath.length
      }
    };

    const dataStr = JSON.stringify(graphData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `dependency-graph-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const filteredDays = getFilteredDays();

  return (
    <div className={`bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
            <GitBranch size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Learning Path Dependencies</h3>
            <p className="text-sm text-slate-400">Visualize how concepts build on each other</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Controls */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
          >
            <option value="all">All Days</option>
            <option value="critical">Critical Path Only</option>
            <option value="dependencies">With Dependencies</option>
          </select>

          {/* Zoom Controls */}
          <button
            onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 2))}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
          >
            <Maximize2 size={16} />
          </button>
          <button
            onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.5))}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
          >
            <Minimize2 size={16} />
          </button>

          {/* Export Button */}
          <button
            onClick={exportGraph}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
            title="Export Graph Data"
          >
            <Download size={16} />
          </button>

          {/* Legend Toggle */}
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
          >
            <Info size={16} />
          </button>
        </div>
      </div>

      {/* Graph Container */}
      <div className="relative min-h-[500px] overflow-auto p-6">
        <div 
          className="relative"
          style={{ 
            width: filteredDays.length * 140 * zoomLevel + 200,
            height: 400,
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left'
          }}
        >
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {filteredDays.map((day, index) => {
              const node = dependencies[day];
              if (!node) return null;
              
              const startPos = calculateNodePosition(index, filteredDays.length);
              
              return Array.from(node.neededFor)
                .filter(nextDay => filteredDays.includes(nextDay))
                .map((nextDay) => {
                  const nextIndex = filteredDays.indexOf(nextDay);
                  if (nextIndex === -1) return null;
                  
                  const endPos = calculateNodePosition(nextIndex, filteredDays.length);
                  
                  const isCritical = criticalPath.includes(day) && criticalPath.includes(nextDay) &&
                    criticalPath.indexOf(nextDay) === criticalPath.indexOf(day) + 1;

                  return (
                    <g key={`${day}-${nextDay}`}>
                      <line
                        x1={startPos.x + 40}
                        y1={startPos.y + 40}
                        x2={endPos.x + 40}
                        y2={endPos.y + 40}
                        stroke={isCritical ? '#f59e0b' : '#4b5563'}
                        strokeWidth={isCritical ? '3' : '2'}
                        strokeDasharray={isCritical ? 'none' : '5,5'}
                      />
                      {/* Arrow head */}
                      <polygon
                        points={`${endPos.x + 40},${endPos.y + 40} ${endPos.x + 30},${endPos.y + 35} ${endPos.x + 30},${endPos.y + 45}`}
                        fill={isCritical ? '#f59e0b' : '#8b5cf6'}
                      />
                    </g>
                  );
                });
            })}
          </svg>

          {/* Nodes */}
          <div className="relative flex gap-4">
            {filteredDays.map((day, index) => {
              const node = dependencies[day];
              if (!node) return null;
              
              const pos = calculateNodePosition(index, filteredDays.length);
              const taskCount = node.tasks.length;
              const completedCount = node.tasks.filter(t => t.status === 'COMPLETED').length;
              const progress = taskCount > 0 ? (completedCount / taskCount) * 100 : 0;
              
              const isSelected = selectedNode === day;
              const isHovered = hoveredNode === day;
              const isCritical = criticalPath.includes(day);

              return (
                <div
                  key={day}
                  className={`absolute ${getNodeSize(day)} ${getNodeColor(day)} rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200`}
                  style={{
                    left: pos.x,
                    top: pos.y,
                    transform: isSelected || isHovered ? 'scale(1.1)' : 'scale(1)',
                    zIndex: isSelected || isHovered ? 10 : 1
                  }}
                  onClick={() => handleNodeClick(day)}
                  onMouseEnter={() => setHoveredNode(day)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <span className="text-xs font-bold">Day {day}</span>
                  <span className="text-xs">{taskCount} {taskCount === 1 ? 'task' : 'tasks'}</span>
                  
                  {/* Progress indicator */}
                  {progress > 0 && (
                    <div className="absolute -bottom-1 left-1 right-1 h-1 bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                  
                  {/* Dependency indicators */}
                  {node.dependsOn.size > 0 && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <ArrowRight size={12} className="text-white transform rotate-45" />
                    </div>
                  )}
                  
                  {/* Critical path indicator */}
                  {isCritical && (
                    <div className="absolute -top-2 -left-2 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Zap size={12} className="text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="p-6 border-t border-slate-700">
          <h4 className="text-sm font-medium text-white mb-3">Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500/20 border border-purple-500/50 rounded" />
              <span className="text-xs text-slate-400">High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-indigo-500/20 border border-indigo-500/50 rounded" />
              <span className="text-xs text-slate-400">Has Dependencies</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/50 rounded" />
              <span className="text-xs text-slate-400">Critical Path</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/50 rounded" />
              <span className="text-xs text-slate-400">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/20 border border-green-500/50 rounded" />
              <span className="text-xs text-slate-400">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500/20 border border-red-500/50 rounded" />
              <span className="text-xs text-slate-400">Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <ArrowRight size={12} className="text-white transform rotate-45" />
              </div>
              <span className="text-xs text-slate-400">Dependency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <Zap size={12} className="text-white" />
              </div>
              <span className="text-xs text-slate-400">Critical Node</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Node Details */}
      {selectedNode && dependencies[selectedNode] && (
        <div className="p-6 border-t border-slate-700 bg-slate-800/80">
          <h4 className="text-sm font-medium text-white mb-3">
            Day {selectedNode} Details
          </h4>
          <div className="space-y-2">
            {dependencies[selectedNode].tasks.map((task, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                <div className="flex items-center gap-2">
                  {task.status === 'COMPLETED' ? (
                    <CheckCircle size={14} className="text-green-400" />
                  ) : task.status === 'IN_PROGRESS' ? (
                    <Clock size={14} className="text-blue-400" />
                  ) : (
                    <AlertCircle size={14} className="text-slate-400" />
                  )}
                  <span className="text-sm text-white">{task.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {task.priority && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      task.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {task.priority}
                    </span>
                  )}
                  {task.estimatedHours && (
                    <span className="text-xs text-slate-400">{task.estimatedHours}h</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskDependencyGraph;