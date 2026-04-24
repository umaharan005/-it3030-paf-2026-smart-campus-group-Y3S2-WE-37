import React from 'react';

const PageHeader = ({ title, description, actions }) => {
    return (
        <header className="mb-10 rounded-3xl p-8 border border-slate-800 shadow-xl overflow-hidden relative group min-h-[160px] flex flex-col justify-center">
            {/* Background Image Layer */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop")' }}
            ></div>
            
            {/* Dark Blue Overlay (Reduced Opacity and No Blur) */}
            <div className="absolute inset-0 bg-slate-900/60 z-0"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-bold border border-white/20 shadow-lg text-white">SH</div>
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest drop-shadow-md">Operations Center</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-3 italic text-white drop-shadow-lg">{title}</h1>
                    <p className="text-blue-100/90 text-lg leading-relaxed font-medium drop-shadow-md">
                        {description}
                    </p>
                </div>
                {actions && (
                    <div className="flex-shrink-0 relative z-20">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
};

export default PageHeader;
