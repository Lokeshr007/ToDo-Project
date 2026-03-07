import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/**
 * Enhanced Stat Card component for the dashboard.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon The icon representing the stat.
 * @param {string} props.label The label text.
 * @param {number|string} props.value The value of the stat.
 * @param {string} props.subtext Optional additional information.
 * @param {number} props.trend The trend percentage.
 * @param {string} props.color The color theme.
 * @param {string} props.bgColor The background gradient classes.
 */
function StatCard({ icon, label, value, subtext, trend, color, bgColor }) {
  const isPositive = trend >= 0;
  
  return (
    <div className={`${bgColor} rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-white/20 rounded-lg">
          {icon}
        </div>
        {trend !== undefined && trend !== 0 && (
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            isPositive ? 'bg-green-500/30' : 'bg-red-500/30'
          }`}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-2xl sm:text-3xl font-bold mb-1">{value}</p>
        <p className="text-xs sm:text-sm text-white/80">{label}</p>
        {subtext && <p className="text-xs text-white/60 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}

export default StatCard;
