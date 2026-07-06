import { Heart, MessageCircle, ExternalLink, Play } from 'lucide-react'
import styles from '@/app/report/[id]/page.module.css'

export default function PostShowcase({ properties }: { properties: any }) {
  if (!properties?.posts || properties.posts.length === 0) return null

  return (
    <section className={`${styles.slide} ${styles.slideShowcase}`}>
      <h3 className={styles.slideTitle}>
        {properties.title || 'Destaques do Período'}
      </h3>
      
      <div className={styles.showcaseGrid}>
        {properties.posts.map((post: any, idx: number) => {
          const isVideo = post.media_type === 'VIDEO'
          return (
            <div key={idx} className={styles.postCard}>
              <div className={styles.postMediaWrapper}>
                {post.media_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={post.media_url} alt="Post Thumbnail" className={styles.postMedia} />
                ) : (
                  <div className={styles.postMediaPlaceholder}>Nenhuma mídia</div>
                )}
                {isVideo && (
                  <div className={styles.videoOverlay}>
                    <Play size={32} fill="currentColor" />
                  </div>
                )}
              </div>
              
              <div className={styles.postContent}>
                <p className={styles.postCaption}>
                  {post.caption || 'Sem legenda'}
                </p>
                
                <div className={styles.postMetrics}>
                  <div className={styles.metricsGroup}>
                    {isVideo && typeof post.plays_count === 'number' ? (
                      <span className={styles.metricItem}>
                        <Play size={14} /> {post.plays_count}
                      </span>
                    ) : (
                      <span className={styles.metricItem}>
                        <Heart size={14} /> {post.like_count || 0}
                      </span>
                    )}
                    <span className={styles.metricItem}>
                      <MessageCircle size={14} /> {post.comments_count || 0}
                    </span>
                  </div>
                  
                  {post.permalink && (
                    <a href={post.permalink} target="_blank" rel="noreferrer" className={styles.postLink}>
                      Ver <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

