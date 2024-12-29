import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-white p-2 border rounded shadow-lg">
        <p className="text-sm">Cena: {payload[0].payload.price}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm">
            {p.name}: {p.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const OptionsCalculator = () => {
  const [strategies, setStrategies] = useState([
    { id: 1, type: 'call', position: 'long', premium: 5, strike: 100, active: true, color: '#4CAF50', visible: true },
    { id: 2, type: 'call', position: 'short', premium: 5, strike: 100, active: false, color: '#f44336', visible: true }
  ]);
  const [stockPosition, setStockPosition] = useState({ active: false, position: 'long', quantity: 100, visible: true });
  const [combinedVisible, setCombinedVisible] = useState(true);
  const [hover, setHover] = useState(null);
  const [lineWidth, setLineWidth] = useState(2);
  const [showCombined, setShowCombined] = useState(true);
  
  const priceRange = 40;

  const calculateStrategyValue = (price, strategy) => {
    const { type, position, premium, strike } = strategy;
    let value = 0;

    if (type === 'call') {
      value = Math.max(price - strike, 0);
    } else {
      value = Math.max(strike - price, 0);
    }

    return position === 'long' 
      ? Number((value - premium).toFixed(2))
      : Number((-value + premium).toFixed(2));
  };

  const calculateStockValue = (price, basePrice) => {
    const value = price - basePrice;
    return stockPosition.position === 'long' ? value : -value;
  };

  const generateData = () => {
    const activeStrategies = strategies.filter(s => s.active);
    if (activeStrategies.length === 0 && !stockPosition.active) return [];

    const strikes = activeStrategies.map(s => s.strike);
    const minStrike = strikes.length > 0 ? Math.min(...strikes) : 100;
    const maxStrike = strikes.length > 0 ? Math.max(...strikes) : 100;
    const minPrice = Math.max(minStrike - priceRange, 0);
    const maxPrice = maxStrike + priceRange;
    
    const data = [];
    for (let price = minPrice; price <= maxPrice; price += 2) {
      const dataPoint = { price };
      
      if (stockPosition.active) {
        dataPoint.stock = calculateStockValue(price, minStrike) * (stockPosition.quantity / 100);
      }

      strategies.forEach(strategy => {
        if (strategy.active) {
          dataPoint[`strategy${strategy.id}`] = calculateStrategyValue(price, strategy);
        }
      });

      if (showCombined && (activeStrategies.length > 1 || (activeStrategies.length > 0 && stockPosition.active))) {
        dataPoint.combined = (stockPosition.active ? dataPoint.stock : 0) +
          activeStrategies.reduce((sum, strategy) => sum + calculateStrategyValue(price, strategy), 0);
      }

      data.push(dataPoint);
    }
    return data;
  };

  const addStrategy = () => {
    const newId = Math.max(...strategies.map(s => s.id)) + 1;
    setStrategies([...strategies, {
      id: newId,
      type: 'call',
      position: 'long',
      premium: 5,
      strike: 100,
      active: false,
      visible: true,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }]);
  };

  const updateStrategy = (id, field, value) => {
    setStrategies(strategies.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const removeStrategy = (id) => {
    setStrategies(strategies.filter(s => s.id !== id));
  };

  const getStrategyName = (strategy) => {
    const action = strategy.position === 'long' ? 'Kupno' : 'Sprzedaż';
    return `${action} ${strategy.type.toUpperCase()} (Strike: ${strategy.strike})`;
  };

  const handleLegendClick = (e) => {
    if (e.dataKey === 'stock') {
      setStockPosition(prev => ({ ...prev, visible: !prev.visible }));
    } else if (e.dataKey === 'combined') {
      setCombinedVisible(!combinedVisible);
    } else {
      const strategyId = parseInt(e.dataKey.replace('strategy', ''));
      updateStrategy(strategyId, 'visible', !strategies.find(s => s.id === strategyId).visible);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Kalkulator Strategii Opcyjnych</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {strategies.map(strategy => (
              <div key={strategy.id} className="flex space-x-2 items-center p-2 border rounded">
                <input
                  type="checkbox"
                  checked={strategy.active}
                  onChange={(e) => updateStrategy(strategy.id, 'active', e.target.checked)}
                />
                <select
                  className="p-1 border rounded"
                  value={strategy.type}
                  onChange={(e) => updateStrategy(strategy.id, 'type', e.target.value)}
                >
                  <option value="call">Call</option>
                  <option value="put">Put</option>
                </select>
                <select
                  className="p-1 border rounded"
                  value={strategy.position}
                  onChange={(e) => updateStrategy(strategy.id, 'position', e.target.value)}
                >
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-1">
                    <label className="text-sm">Strike:</label>
                    <input
                      type="number"
                      className="w-20 p-1 border rounded"
                      value={strategy.strike}
                      onChange={(e) => updateStrategy(strategy.id, 'strike', parseFloat(e.target.value))}
                      min="0"
                      step="1"
                    />
                  </div>
                  <div className="flex items-center space-x-1">
                    <label className="text-sm">Premia:</label>
                    <input
                      type="number"
                      className="w-20 p-1 border rounded"
                      value={strategy.premium}
                      onChange={(e) => updateStrategy(strategy.id, 'premium', parseFloat(e.target.value))}
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeStrategy(strategy.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  X
                </button>
              </div>
            ))}
            <button
              onClick={addStrategy}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Dodaj opcję
            </button>
            
            <div className="flex space-x-2 items-center p-2 border rounded">
              <input
                type="checkbox"
                checked={stockPosition.active}
                onChange={(e) => setStockPosition(prev => ({ ...prev, active: e.target.checked }))}
              />
              <select
                className="p-1 border rounded"
                value={stockPosition.position}
                onChange={(e) => setStockPosition(prev => ({ ...prev, position: e.target.value }))}
              >
                <option value="long">Long Stock</option>
                <option value="short">Short Stock</option>
              </select>
              <div className="flex items-center space-x-1">
                <label className="text-sm">Ilość:</label>
                <input
                  type="number"
                  className="w-20 p-1 border rounded"
                  value={stockPosition.quantity}
                  onChange={(e) => setStockPosition(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                  min="1"
                  step="1"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showCombined}
                onChange={(e) => setShowCombined(e.target.checked)}
              />
              <span>Pokaż strategię łączoną</span>
            </label>
          </div>

          <div className="w-full" style={{ height: '50vw', width: '90vw' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={generateData()}
                margin={{ top: 20, right: 30, left: 100, bottom: 60 }}
                onMouseMove={(e) => e && e.activePayload && setHover(e.activePayload[0].payload)}
                onMouseLeave={() => setHover(null)}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="price"
                  label={{ value: 'Cena Aktywa Bazowego', position: 'bottom', offset: 40 }}
                />
                <YAxis 
                  label={{ value: 'Zysk/Strata', angle: -90, position: 'left', offset: -80 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  onClick={handleLegendClick}
                  cursor="pointer"
                  formatter={(value, entry) => {
                    const { dataKey } = entry;
                    let isVisible = true;
                    
                    if (dataKey === 'stock') {
                      isVisible = stockPosition.visible;
                    } else if (dataKey === 'combined') {
                      isVisible = combinedVisible;
                    } else {
                      const strategyId = parseInt(dataKey.replace('strategy', ''));
                      isVisible = strategies.find(s => s.id === strategyId)?.visible;
                    }
                    
                    return (
                      <span style={{ color: isVisible ? '#000' : '#999' }}>
                        {value}
                      </span>
                    );
                  }}
                />
                <ReferenceLine y={0} stroke="black" strokeDasharray="3 3" />
                
                {stockPosition.active && stockPosition.visible && (
                  <Line
                    type="monotone"
                    dataKey="stock"
                    stroke="#2196F3"
                    name={`${stockPosition.position === 'long' ? 'Long' : 'Short'} ${stockPosition.quantity} akcji`}
                    dot={false}
                    strokeWidth={lineWidth}
                    strokeDasharray="5 5"
                  />
                )}
                
                {strategies.map(strategy => (
                  strategy.active && strategy.visible && (
                    <Line
                      key={strategy.id}
                      type="monotone"
                      dataKey={`strategy${strategy.id}`}
                      stroke={strategy.color}
                      name={getStrategyName(strategy)}
                      dot={false}
                      strokeWidth={lineWidth}
                    />
                  )
                ))}
                
                {showCombined && combinedVisible && (strategies.filter(s => s.active).length > 1 || 
                  (strategies.filter(s => s.active).length > 0 && stockPosition.active)) && (
                  <Line
                    type="monotone"
                    dataKey="combined"
                    stroke="#000"
                    name="Strategia łączona"
                    dot={false}
                    strokeWidth={lineWidth + 1}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptionsCalculator;