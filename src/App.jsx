import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import gallery from './data/gallery.json'
import './App.css'

const categoryOrder = ['戒指', '项链', '耳饰', '手链', '套装_组合图', '胸针_别针', '裸石_宝石']
const colorOrder = ['蓝色', '黄色', '绿色', '红色', '粉色', '无明显彩钻']

const categoryNotes = {
  戒指: '高频主推款与收藏级主石，适合快速锁定客户兴趣中心。',
  项链: '适合大图浏览与佩戴想象，重点呈现轮廓、色彩与场景感。',
  耳饰: '适合成对查看与上身联想，方便客户快速对比不同气质。',
  手链: '适合细节导向型客户，适合从系列感和佩戴层次切入。',
  套装_组合图: '保留完整搭配关系，适合客户整体挑选与搭配想象。',
  胸针_别针: '适合作为高珠点睛类展示，保持独立陈列更清晰。',
  裸石_宝石: '保留主石素材，便于后期做定制沟通与设计延展。',
}

function App() {
  const [query, setQuery] = useState('')
  const [globalColor, setGlobalColor] = useState('全部')
  const [selectedId, setSelectedId] = useState(null)
  const [showBrandRail, setShowBrandRail] = useState(false)
  const [openSections, setOpenSections] = useState(() => new Set(['戒指', '项链']))
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())

  useEffect(() => {
    document.title = 'AzureVerse'
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setShowBrandRail(window.scrollY > window.innerHeight * 0.55)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
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
      dominant: Object.entries(byCategory).sort((left, right) => right[1] - left[1])[0],
      categories: Object.keys(byCategory).length,
    }
  }, [])

  const filteredGallery = useMemo(() => {
    return gallery.filter((item) => {
      const matchesColor = globalColor === '全部' || item.color === globalColor
      const matchesQuery =
        !deferredQuery ||
        item.id.toLowerCase().includes(deferredQuery) ||
        item.category.toLowerCase().includes(deferredQuery) ||
        item.color.toLowerCase().includes(deferredQuery) ||
        item.originalFilename.toLowerCase().includes(deferredQuery)

      return matchesColor && matchesQuery
    })
  }, [deferredQuery, globalColor])

  const groupedCategories = useMemo(() => {
    return categoryOrder
      .map((category) => {
        const items = filteredGallery.filter((item) => item.category === category)
        const byColor = colorOrder
          .map((color) => ({
            color,
            items: items.filter((item) => item.color === color),
          }))
          .filter((group) => group.items.length > 0)

        return {
          category,
          total: items.length,
          leadImage: items[0]?.image,
          note: categoryNotes[category] ?? '',
          byColor,
        }
      })
      .filter((section) => section.total > 0)
  }, [filteredGallery])

  const selectedItem = filteredGallery.find((item) => item.id === selectedId) ?? gallery.find((item) => item.id === selectedId)

  const toggleSection = (category) => {
    startTransition(() => {
      setOpenSections((current) => {
        const next = new Set(current)
        if (next.has(category)) {
          next.delete(category)
        } else {
          next.add(category)
        }
        return next
      })
    })
  }

  return (
    <div className="page-shell">
      <div className={showBrandRail ? 'brand-rail is-visible' : 'brand-rail'}>
        <img src="/az-monogram.png" alt="Azure Jewelry monogram" className="brand-rail-monogram" />
        <img src="/azure-jewelry-text.png" alt="Azure Jewelry" className="brand-rail-text" />
      </div>

      <section className="hero-stage">
        <div className="hero-orbit">
          <div className="petal petal-a"></div>
          <div className="petal petal-b"></div>
          <div className="petal petal-c"></div>
          <div className="petal petal-d"></div>
          <div className="petal petal-e"></div>
          <div className="petal petal-f"></div>
          <div className="hero-core">
            <img src="/az-monogram.png" alt="Azure Jewelry monogram" />
          </div>
        </div>

        <div className="hero-copy">
          <p className="eyebrow">AzureVerse Archive</p>
          <h1>让客户一进入，就像翻开一座正在绽放的高级珠宝花园。</h1>
          <p className="hero-text">
            开场先用一段象征品牌气质的花朵绽放动效做记忆点，向下滚动后再露出品牌 logo 和完整图库。
            后面的浏览逻辑则回到实用层，按品类折叠展开、按颜色筛选、按图片 ID 检索，方便客户和团队快速挑图。
          </p>
          <div className="hero-actions">
            <a href="#catalogue" className="primary-link">
              浏览产品库
            </a>
            <span className="hero-meta">Bloom intro, logo reveal, layered gallery.</span>
          </div>
        </div>

        <div className="hero-stats">
          <div className="metric-card">
            <span className="metric-label">总图片数</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">主品类数</span>
            <strong>{stats.categories}</strong>
          </div>
          <div className="metric-card accent">
            <span className="metric-label">主力类目</span>
            <strong>{stats.dominant?.[0] ?? '未分类'}</strong>
            <span className="metric-sub">{stats.dominant?.[1] ?? 0} 张</span>
          </div>
        </div>

        <div className="hero-scroll-hint">
          <span>Scroll to reveal</span>
        </div>
      </section>

      <section className="logo-reveal-panel">
        <div className="logo-stack">
          <img src="/azure-jewelry-text.png" alt="Azure Jewelry" className="brand-title-image" />
          <p className="logo-caption">
            Azure Jewelry 的前端展示不应该只是“图片堆叠”，而应该先有品牌气质，再进入筛选效率。
          </p>
        </div>
        <div className="logo-copy">
          <p className="eyebrow">Brand Reveal</p>
          <h2>先建立品牌印象，再进入客户真正会用到的产品选择层。</h2>
          <p>
            这里的逻辑不是把所有筛选器直接砸给客户，而是用一个更轻、更优雅的滚动转场把人带进产品世界。
            用户滑下去以后，看到的是 Azure Jewelry 的品牌标识、结构化分类入口，以及大量可展开浏览的产品图。
          </p>
        </div>
      </section>

      <section className="control-panel" id="catalogue">
        <div className="control-header">
          <div>
            <p className="eyebrow">Curated Catalogue</p>
            <h2>按品类折叠浏览，按颜色和图片 ID 精准定位。</h2>
          </div>
          <label className="search-box">
            <span>Search</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="输入图片 ID、品类、颜色"
            />
          </label>
        </div>

        <div className="global-filter-row">
          <span className="filter-label">主石颜色快速筛选</span>
          <div className="chip-row">
            {['全部', ...colorOrder].map((color) => (
              <button
                key={color}
                type="button"
                className={color === globalColor ? 'chip is-active' : 'chip'}
                onClick={() => startTransition(() => setGlobalColor(color))}
              >
                {color}
              </button>
            ))}
          </div>
          <div className="filter-summary">
            当前显示 <strong>{filteredGallery.length}</strong> 张图片
          </div>
        </div>
      </section>

      <section className="accordion-list">
        {groupedCategories.map((section, index) => {
          const isOpen = openSections.has(section.category)
          return (
            <article
              key={section.category}
              className={isOpen ? 'category-accordion is-open' : 'category-accordion'}
            >
              <button
                type="button"
                className="accordion-trigger"
                onClick={() => toggleSection(section.category)}
                aria-expanded={isOpen}
              >
                <div className="accordion-left">
                  <span className="accordion-index">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{section.category}</h3>
                    <p>{section.note}</p>
                  </div>
                </div>
                <div className="accordion-right">
                  <span>{section.total} 张</span>
                  <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
                </div>
              </button>

              <div className="accordion-content">
                <div className="accordion-preview">
                  {section.leadImage ? (
                    <img src={section.leadImage} alt={section.category} loading="lazy" />
                  ) : null}
                </div>
                <div className="accordion-groups">
                  {section.byColor.map((group) => (
                    <div key={`${section.category}-${group.color}`} className="color-group">
                      <div className="color-group-head">
                        <span className="color-badge">{group.color}</span>
                        <span className="color-count">{group.items.length} 张</span>
                      </div>
                      <div className="gallery-grid">
                        {group.items.map((item) => (
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
                              <p className="gallery-meta">
                                {item.color} · {item.originalFilename}
                              </p>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          )
        })}
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
