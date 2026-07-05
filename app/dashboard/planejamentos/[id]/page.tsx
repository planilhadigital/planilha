'use client'

import { use } from 'react'
import PlanejamentoBoard from '../PlanejamentoBoard'

export default function QuadroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <PlanejamentoBoard id={id} />
}
