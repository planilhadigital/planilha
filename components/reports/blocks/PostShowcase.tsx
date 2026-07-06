import { Heart, MessageCircle, ExternalLink } from 'lucide-react'

export default function PostShowcase({ properties }: { properties: any }) {
  if (!properties?.posts || properties.posts.length === 0) return null

  return (
    <div className="anim-fade-up">
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        {properties.title || 'Destaques do Período'}
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        {properties.posts.map((post: any, idx: number) => (
          <div key={idx} style={{ 
            background: 'var(--bg-elevated)', 
            borderRadius: 'var(--r-md)', 
            overflow: 'hidden',
            border: '1px solid var(--border)' 
          }}>
            {post.media_url ? (
              <div style={{ height: '200px', overflow: 'hidden', position: 'relative', background: 'var(--bg-default)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.media_url} alt="Post Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ height: '100px', background: 'var(--bg-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Nenhuma mídia
              </div>
            )}
            
            <div style={{ padding: '1rem' }}>
              <p style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-primary)', 
                marginBottom: '1rem', 
                display: '-webkit-box', 
                WebkitLineClamp: 3, 
                WebkitBoxOrient: 'vertical', 
                overflow: 'hidden' 
              }}>
                {post.caption || 'Sem legenda'}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Heart size={14} /> {post.like_count || 0}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MessageCircle size={14} /> {post.comments_count || 0}
                  </span>
                </div>
                
                {post.permalink && (
                  <a href={post.permalink} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Ver <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
