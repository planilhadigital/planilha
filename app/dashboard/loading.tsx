export default function DashboardLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem 0' }}>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div className="skeleton" style={{ width: '120px', height: '120px', borderRadius: '50%' }}></div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="skeleton" style={{ width: '40%', height: '32px', borderRadius: 'var(--r-sm)' }}></div>
          <div className="skeleton" style={{ width: '20%', height: '24px', borderRadius: 'var(--r-sm)' }}></div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="skeleton" style={{ width: '100px', height: '32px', borderRadius: 'var(--r-md)' }}></div>
        <div className="skeleton" style={{ width: '100px', height: '32px', borderRadius: 'var(--r-md)' }}></div>
        <div className="skeleton" style={{ width: '100px', height: '32px', borderRadius: 'var(--r-md)' }}></div>
      </div>

      <div className="skeleton" style={{ width: '100%', height: '300px', borderRadius: 'var(--r-lg)' }}></div>
      <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: 'var(--r-lg)' }}></div>
    </div>
  )
}
