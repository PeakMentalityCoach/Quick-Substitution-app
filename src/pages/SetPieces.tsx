import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Trash2, CornerDownRight, Wind, MoveHorizontal } from 'lucide-react';
import { SetPieceLayout } from '../types';
import { loadData, saveSetPieceLayouts } from '../utils/storage';

const SET_PIECE_CATEGORIES = [
  { id: 'offensive-corner', name: 'Corner - Offensive', icon: CornerDownRight, color: 'pmc-green' },
  { id: 'defensive-corner', name: 'Corner - Defensive', icon: CornerDownRight, color: 'pmc-green' },
  { id: 'free-kick-central', name: 'Free Kick - Central', icon: Wind, color: 'pmc-gold' },
  { id: 'free-kick-wide', name: 'Free Kick - Wide', icon: Wind, color: 'pmc-gold' },
  { id: 'throw-in-attacking', name: 'Throw-in - Attacking', icon: MoveHorizontal, color: 'pmc-green' },
  { id: 'throw-in-defending', name: 'Throw-in - Defending', icon: MoveHorizontal, color: 'pmc-green' },
] as const;

export default function SetPieces() {
  const [layouts, setLayouts] = useState<SetPieceLayout[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('offensive-corner');
  const [layoutName, setLayoutName] = useState('');

  useEffect(() => {
    const data = loadData();
    setLayouts(data.setPieceLayouts);
  }, []);

  const handleSaveLayout = () => {
    if (!layoutName.trim()) {
      alert('Please enter a name for this layout');
      return;
    }

    const newLayout: SetPieceLayout = {
      id: Date.now().toString(),
      name: layoutName,
      type: selectedCategory as any,
      positions: [],
    };

    const newLayouts = [...layouts, newLayout];
    setLayouts(newLayouts);
    saveSetPieceLayouts(newLayouts);
    setLayoutName('');
  };

  const handleDeleteLayout = (layoutId: string) => {
    if (confirm('Delete this set-piece layout?')) {
      const newLayouts = layouts.filter(l => l.id !== layoutId);
      setLayouts(newLayouts);
      saveSetPieceLayouts(newLayouts);
    }
  };

  const getCategoryLayouts = (category: string) => {
    return layouts.filter(l => l.type === category);
  };

  const selectedCategoryData = SET_PIECE_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-l-4 border-pmc-gold-500"
      >
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold text-pmc-gray-800">Set Piece Planner</h2>
          <p className="text-pmc-gray-600 mt-2">Configure and save set-piece layouts for all situations</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-4">
            <h3 className="font-bold text-pmc-gray-800 mb-4">Categories</h3>
            <div className="space-y-2">
              {SET_PIECE_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                const categoryLayouts = getCategoryLayouts(category.id);

                return (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                      isSelected
                        ? 'bg-gradient-to-r from-pmc-green-600 to-pmc-green-500 text-white shadow-lg'
                        : 'bg-pmc-gray-50 text-pmc-gray-700 hover:bg-pmc-green-50'
                    }`}
                  >
                    <Icon size={20} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{category.name}</div>
                      <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-pmc-gray-500'}`}>
                        {categoryLayouts.length} layout{categoryLayouts.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Create New Layout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-6"
          >
            <h3 className="font-bold text-pmc-gray-800 mb-4 flex items-center gap-2">
              {selectedCategoryData && <selectedCategoryData.icon size={24} className="text-pmc-gold-600" />}
              Create New {selectedCategoryData?.name} Layout
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                placeholder="Enter layout name (e.g., 'Near Post Runner')"
                className="flex-1 px-4 py-3 border-2 border-pmc-gray-200 rounded-xl focus:ring-2 focus:ring-pmc-green-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSaveLayout()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveLayout}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pmc-green-600 to-pmc-green-500 text-white rounded-xl hover:from-pmc-green-700 hover:to-pmc-green-600 shadow-lg font-medium"
              >
                <Save size={20} />
                Save Layout
              </motion.button>
            </div>
          </motion.div>

          {/* Existing Layouts */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="font-bold text-pmc-gray-800 mb-4">
              Saved {selectedCategoryData?.name} Layouts
            </h3>

            {getCategoryLayouts(selectedCategory).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-pmc-gray-400 mb-2">
                  {selectedCategoryData && <selectedCategoryData.icon size={48} className="mx-auto mb-3" />}
                </div>
                <p className="text-pmc-gray-600">No layouts saved for this category yet</p>
                <p className="text-sm text-pmc-gray-500 mt-1">Create your first layout above</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {getCategoryLayouts(selectedCategory).map((layout) => (
                  <motion.div
                    key={layout.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-pmc-gray-50 to-white border-2 border-pmc-gray-200 rounded-xl p-4 hover:border-pmc-green-400 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-pmc-gray-800 text-lg">{layout.name}</h4>
                        <p className="text-sm text-pmc-gray-600 mt-1">
                          {layout.positions.length} position{layout.positions.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteLayout(layout.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>

                    {/* Mini Pitch Preview */}
                    <div className="relative w-full bg-pitch-green rounded-lg overflow-hidden" style={{ paddingBottom: '66.67%' }}>
                      <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 100 66.67"
                        preserveAspectRatio="none"
                      >
                        <rect x="2" y="2" width="96" height="62.67" fill="none" stroke="white" strokeWidth="0.3" opacity="0.5" />
                        <line x1="50" y1="2" x2="50" y2="64.67" stroke="white" strokeWidth="0.3" opacity="0.5" />
                      </svg>
                      {layout.positions.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/60 text-xs">
                          No positions set
                        </div>
                      )}
                      {layout.positions.map((pos) => (
                        <div
                          key={pos.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2"
                          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        >
                          <div className="w-3 h-3 bg-white rounded-full border border-pmc-green-700"></div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-gradient-to-r from-pmc-gold-50 to-pmc-green-50 border-2 border-pmc-gold-200 rounded-2xl p-6"
      >
        <h4 className="font-bold text-pmc-gray-800 mb-2">Set Piece Categories</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-pmc-gray-700">
          <div>
            <strong className="text-pmc-green-700">Corners:</strong> Offensive & Defensive positioning
          </div>
          <div>
            <strong className="text-pmc-gold-700">Free Kicks:</strong> Central & Wide variations
          </div>
          <div>
            <strong className="text-pmc-green-700">Throw-ins:</strong> Attacking & Defending setups
          </div>
        </div>
      </motion.div>
    </div>
  );
}
