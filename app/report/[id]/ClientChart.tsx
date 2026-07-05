'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ClientChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <p style={{color: '#666'}}>Nenhum dado disponível para o período.</p>

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="#666" 
          tick={{ fill: '#666', fontSize: 12 }} 
          tickMargin={10} 
        />
        <YAxis 
          stroke="#666" 
          tick={{ fill: '#666', fontSize: 12 }} 
          tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
          itemStyle={{ color: '#fff' }}
        />
        <Line 
          type="monotone" 
          dataKey="reach" 
          name="Alcance"
          stroke="#FA4616" 
          strokeWidth={3} 
          dot={false}
          activeDot={{ r: 6 }} 
        />
        <Line 
          type="monotone" 
          dataKey="impressions" 
          name="Impressões"
          stroke="#8A2BE2" 
          strokeWidth={3} 
          dot={false}
          activeDot={{ r: 6 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
