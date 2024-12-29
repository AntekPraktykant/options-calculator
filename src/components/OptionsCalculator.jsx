import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

// Komponent do wyświetlania tooltipa
const CustomTooltip = ({ active, payload, getOptionLine }) => {
  if (active && payload && payload.length > 0) {
    const optionValue = payload.find(p => p.dataKey === getOptionLine())?.value || 0;
    return (
      <div className="bg-white p-2 border rounded shadow-lg">
        <p className="text-sm">Cena: {payload[0].payload.price}</p>
        <p className="text-sm">Wynik: {optionValue.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const OptionsCalculator = () => {
  // Stany komponentu
  const [optionType, setOptionType] = useState('call');
  const [position, setPosition] = useState('long');
  const [hover, setHover] = useState(null);
  const [optionLineWidth, setOptionLineWidth] = useState(2);
  const [stockLineWidth, setStockLineWidth] = useState(2);
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.1);
  const [premium, setPremium] = useState(5);
  
  // Stałe parametry
  const strikePrice = 100;
  const priceRange = 40;
  const sharesQuantity = 100;

  // Funkcje pomocnicze
  const getOptionLine = () => {
    if (optionType === 'call') {
      return position === 'long' ? 'longCall' : 'shortCall';
    }
    return position === 'long' ? 'longPut' : 'shortPut';
  };

  const getStrategyName = () => {
    if (optionType === 'call') {
      return position === 'long' ? 'Kupno Call' : 'Sprzedaż Call';
    }
    return position === 'long' ? 'Kupno Put' : 'Sprzedaż Put';
  };

  const getBackgroundColor = () => {
    if (!hover) return 'transparent';
    const optionValue = hover[getOptionLine()];
    return optionValue > 0 
      ? `rgba(76, 175, 80, ${backgroundOpacity})` 
      : `rgba(244, 67, 54, ${backgroundOpacity})`;
  };

  // Generowanie danych dla wykresu
  const generateData = () => {
  const data = [];
  const minPrice = Math.max(strikePrice - priceRange, 0);
  const maxPrice = strikePrice + priceRange;
  
  // Dodajmy log aby zobaczyć zakres cen
  console.log('Price range:', { minPrice, maxPrice });
  
  for (let price = minPrice; price <= maxPrice; price += 2) {
    // Obliczamy wartości i logujemy je dla debugowania
    const longCallPayoff = Number((Math.max(price - strikePrice, 0) - premium).toFixed(2));
    const shortCallPayoff = Number((-Math.max(price - strikePrice, 0) + premium).toFixed(2));
    const longPutPayoff = Number((Math.max(strikePrice - price, 0) - premium).toFixed(2));
    const shortPutPayoff = Number((-Math.max(strikePrice - price, 0) + premium).toFixed(2));
    const stockPosition = Number(((price - strikePrice) * (sharesQuantity / 100)).toFixed(2));

    // Logujemy wartości dla pierwszej iteracji
    if (price === minPrice) {
      console.log('First data point values:', {
        price,
        longCall: longCallPayoff,
        shortCall: shortCallPayoff,
        longPut: longPutPayoff,
        shortPut: shortPutPayoff,
        stock: stockPosition
      });
    }

    data.push({
      price,
      longCall: longCallPayoff,
      shortCall: shortCallPayoff,
      longPut: longPutPayoff,
      shortPut: shortPutPayoff,
      stock: stockPosition
    });
  }
  
  return data;
};

  const data = generateData();
  
  console.log('Generated data:', data);
  console.log('Current option line:', getOptionLine());

  // Renderowanie komponentu
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Porównanie Strategii Opcyjnej z Pozycją w Akcjach</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-4 mb-8">
            <select
              className="p-2 border rounded"
              value={optionType}
              onChange={(e) => setOptionType(e.target.value)}
            >
              <option value="call">Opcja Call</option>
              <option value="put">Opcja Put</option>
            </select>
            <select
              className="p-2 border rounded"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            >
              <option value="long">Pozycja Długa</option>
              <option value="short">Pozycja Krótka</option>
            </select>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-4">
              <label className="w-48">Grubość linii opcji:</label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={optionLineWidth}
                onChange={(e) => setOptionLineWidth(parseFloat(e.target.value))}
                className="w-48"
              />
              <span>{optionLineWidth}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="w-48">Grubość linii akcji:</label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={stockLineWidth}
                onChange={(e) => setStockLineWidth(parseFloat(e.target.value))}
                className="w-48"
              />
              <span>{stockLineWidth}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="w-48">Nieprzezroczystość tła:</label>
              <input
                type="range"
                min="0.05"
                max="0.3"
                step="0.05"
                value={backgroundOpacity}
                onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
                className="w-48"
              />
              <span>{(backgroundOpacity * 100).toFixed(0)}%</span>
            </div>

            <div className="flex items-center space-x-4">
              <label className="w-48">Premia opcyjna:</label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={premium}
                onChange={(e) => setPremium(parseFloat(e.target.value))}
                className="w-24 p-2 border rounded"
              />
            </div>
          </div>
          
<div 
  className="h-96 relative w-full"
  style={{
    background: getBackgroundColor(),
    transition: 'background-color 0.3s ease',
  }}
>
  <LineChart 
    width={800}
    height={400}
    data={data}
    margin={{
      top: 20,
      right: 30,
      left: 100,
      bottom: 60
    }}
    onMouseMove={(e) => {
      if (e && e.activePayload) {
        setHover(e.activePayload[0].payload);
      }
    }}
    onMouseLeave={() => {
      setHover(null);
    }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis 
      dataKey="price"
      label={{ 
        value: 'Cena Aktywa Bazowego', 
        position: 'bottom',
        offset: 40
      }}
    />
    <YAxis 
      label={{ 
        value: 'Zysk/Strata', 
        angle: -90, 
        position: 'left',
        offset: -80
      }}
    />
    <Tooltip content={<CustomTooltip getOptionLine={getOptionLine} />} />
    <Legend 
      verticalAlign="top"
      height={36}
    />
    
    <ReferenceLine 
      y={0} 
      stroke="black" 
      strokeDasharray="3 3"
      strokeWidth={1}
    />
    
    {hover && (
      <>
        <ReferenceLine
          x={hover.price}
          stroke="#666"
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        <ReferenceLine
          y={hover[getOptionLine()]}
          stroke="#666"
          strokeDasharray="3 3"
          strokeWidth={1}
        />
      </>
    )}
    
    <Line
      type="monotone"
      dataKey={getOptionLine()}
      stroke={position === 'long' ? '#4CAF50' : '#f44336'}
      name={getStrategyName()}
      dot={false}
      strokeWidth={optionLineWidth}
    />
    <Line
      type="monotone"
      dataKey="stock"
      stroke="#2196F3"
      name="Pozycja w 100 akcjach"
      strokeDasharray="5 5"
      dot={false}
      strokeWidth={stockLineWidth}
    />
  </LineChart>
</div>
          
          <div className="text-sm text-gray-600 mt-4">
            <p>Cena wykonania (Strike): {strikePrice}</p>
            <p>Premia opcyjna: {premium}</p>
            <p>Ilość akcji w pozycji porównawczej: {sharesQuantity}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptionsCalculator;