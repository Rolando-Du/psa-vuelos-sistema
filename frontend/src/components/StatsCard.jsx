import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        slate: "bg-slate-500/10 text-slate-400 border-slate-500/20"
    };

    return (
        <div className={`p-6 rounded-2xl border ${colorClasses[color] || colorClasses.slate} bg-slate-900/40 backdrop-blur-sm`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
                        {title}
                    </p>
                    <h3 className="text-3xl font-bold text-white tracking-tight">
                        {value}
                    </h3>
                </div>
                
                {/* renderizado del icono */}
                <div className="p-3 rounded-xl bg-slate-900/50 flex items-center justify-center">
                    {Icon && <Icon size={24} className="opacity-90" />}
                </div>
            </div>
            
            {/* Barra decorativa inferior según el color */}
            <div className={`h-1 w-12 mt-4 rounded-full ${color === 'blue' ? 'bg-blue-600' : color === 'amber' ? 'bg-amber-600' : 'bg-slate-700'}`}></div>
        </div>
    );
};

export default StatsCard;