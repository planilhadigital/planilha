'use client'
import React from 'react'

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn btn-primary btn-sm no-print" style={{ marginLeft: '1rem' }}>
      🖨️ Exportar PDF
    </button>
  )
}
