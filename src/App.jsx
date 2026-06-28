import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import gallery from './data/gallery.json'
import './App.css'

const categoryLabels = ['全部', '戒指', '项链', '耳饰', '手链', '套装_组合图', '胸针_别针', '裸石_宝石']
const colorLabels = ['全部', '蓝色', '黄色', '绿色', '红色', '粉色', '无明显彩钻']

function App() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [activeColor, setActiveColor] = useState('全部')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())

  useEffect(() => {
    document.title = 'AzureVerse'
  }, [])

  useEffect(() => {
    if (!selectedId) return undefined

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedId(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedId])

  const stats = useMemo(() => {
    const byCategory = gallery.reduce((accumulator, item) => {
      accumulator[item.category] = (accumulator[item.category] || 0) + 1
      return accumulator
    }, {})

    return {
      total: gallery.length,
      categoryCount: Object.keys(byCategory).length,
      dominant: Object.entries(byCategory).sort((left, right) => right[1] - left[1])[0],
    }
  }, [])

  const filteredItems = useMemo(() => {
    return gallery.filter((item) => {
      const matchesCategory = activeCategory === '全部' || item.category === activeCategory
      const matchesColor = activeColor === '全部' || item.color === activeColor
      const matchesQuery =
        !deferredQuery ||
        item.id.toLowerCase().includes(deferredQuery) ||
        item.category.toLowerCase().includes(deferredQuery) ||
        item.color.toLowerCase().includes(deferredQuery) ||
        item.originalFilename.toLowerCase().includes(deferredQuery)

      return matchesCategory && matchesColor && matchesQuery
    })
  }, [activeCategory, activeColor, deferredQuery])

  const selectedItem = filteredItems.find((item) => item.id === selectedId) ?? gallery.find((item) => item.id === selectedId)

  return (
    <div className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="brand-mark">
            <img src="/az-monogram.png" alt="Azure Jewelry monogram" />
            <span>AzureVerse</span>
          </div>
          <p className="eyebrow">Jewelry Image Library</p>
          <h1>把零散素材，整理成可以直接展示给客户的珠宝图谱。</h1>
          <p className="hero-text">
            这是一版可直接部署到 GitHub 和 Vercel 的前端图库。每张图都有 ID，可按品类、主石颜色和关键词筛选，
            适合作为后续产品库、展示站和微信内浏览入口的基础版本。
          </p>
          <div className="hero-actions">
            <a href="#gallery" className="primary-link">
              进入图库
            </a>
            <span className="secondary-note">Ready for GitHub, Vercel, and mobile viewing.</span>
          </div>
        </div>

        <div className="hero-aside">
          <div className="stat-card">
            <span className="stat-label">总图片数</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">主品类数</span>
            <strong>{stats.categoryCount}</strong>
          </div>
          <div className="stat-card accent">
            <span className="stat-label">当前最大类</span>
            <strong>{stats.dominant?.[0] ?? '未分类'}</strong>
            <span className="stat-meta">{stats.dominant?.[1] ?? 0} 张</span>
          </div>
        </div>
      </section>

      <section className="intro-band">
        <div>
          <p className="band-label">Structure</p>
          <p>前端先按你现在最实用的逻辑整理：品类优先，主石颜色二级筛选，多品类图保留为组合图。</p>
        </div>
        <div>
          <p className="band-label">Use Case</p>
          <p>后续无论是客户浏览、同事筛图，还是接成后台系统，这一版的数据结构都能继续沿用。</p>
        </div>
      </section>

      <section className="filter-panel" id="gallery">
        <div className="filter-top">
          <div>
            <p className="eyebrow">Curated Gallery</p>
            <h2>AzureVerse Library</h2>
          </div>
          <label className="search-box">
            <span>Search</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="输入图片 ID、品类或颜色"
            />
          </label>
        </div>

        <div className="filter-group">
          <span className="filter-label">按品类筛选</span>
          <div className="chip-row">
            {categoryLabels.map((label) => (
              <button
                key={label}
                type="button"
                className={label === activeCategory ? 'chip is-active' : 'chip'}
                onClick={() => {
                  startTransition(() => setActiveCategory(label))
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">按主石颜色筛选</span>
          <div className="chip-row">
            {colorLabels.map((label) => (
              <button
                key={label}
                type="button"
                className={label === activeColor ? 'chip is-active' : 'chip'}
                onClick={() => {
                  startTransition(() => setActiveColor(label))
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="result-bar">
          <p>
            当前结果 <strong>{filteredItems.length}</strong> 张
          </p>
          <button
            type="button"
            className="reset-button"
            onClick={() => {
              startTransition(() => {
                setActiveCategory('全部')
                setActiveColor('全部')
              })
              setQuery('')
            }}
          >
            重置筛选
          </button>
        </div>
      </section>

      <section className="gallery-grid">
        {filteredItems.map((item) => (
          <article
            key={item.id}
            className="gallery-card"
            onClick={() => setSelectedId(item.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setSelectedId(item.id)
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="gallery-media">
              <img src={item.image} alt={item.id} loading="lazy" />
            </div>
            <div className="gallery-body">
              <div className="card-head">
                <span className="image-id">{item.id}</span>
                <span className="mood-tag">{item.mood}</span>
              </div>
              <h3>{item.category}</h3>
              <p>
                {item.color} · {item.originalFilename}
              </p>
            </div>
          </article>
        ))}
      </section>

      {selectedItem ? (
        <div className="lightbox" onClick={() => setSelectedId(null)} role="presentation">
          <div
            className="lightbox-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selectedItem.id}
          >
            <button type="button" className="lightbox-close" onClick={() => setSelectedId(null)}>
              Close
            </button>
            <div className="lightbox-image">
              <img src={selectedItem.image} alt={selectedItem.id} />
            </div>
            <div className="lightbox-meta">
              <p className="eyebrow">Image Detail</p>
              <h3>{selectedItem.id}</h3>
              <ul>
                <li>品类：{selectedItem.category}</li>
                <li>主石颜色：{selectedItem.color}</li>
                <li>建议颜色识别：{selectedItem.suggestedColor}</li>
                <li>原始文件：{selectedItem.originalFilename}</li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
