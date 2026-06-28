import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import gallery from './data/gallery.json'
import './App.css'

const categoryOrder = ['戒指', '项链', '耳饰', '手链', '套装_组合图', '胸针_别针', '裸石_宝石']
const colorOrder = ['蓝色', '黄色', '绿色', '红色', '粉色', '无明显彩钻']

const translations = {
  zh: {
    siteName: 'AzureVerse',
    archive: 'AzureVerse Archive',
    heroTitle: '让客户一进入，就进入 Azure Jewelry 的珠宝花园。',
    heroText: 'Curated high jewelry selection.',
    browse: '浏览产品库',
    heroMeta: 'Azure Jewelry',
    totalImages: '总图片数',
    totalCategories: '主品类数',
    dominantCategory: '主力类目',
    scrollReveal: '向下浏览',
    brandReveal: '品牌露出',
    revealTitle: 'Azure Jewelry',
    revealText: 'Fine Jewelry Catalogue',
    catalogue: '分类产品库',
    catalogueTitle: '按大类展开，下面附带颜色信息，并以统一尺寸的图片模块展示。',
    search: '搜索',
    searchPlaceholder: '输入图片 ID、品类或颜色',
    quickColor: '颜色快速筛选',
    currentResults: '当前显示',
    imageUnit: '张图片',
    viewDetail: '点击图片可放大查看',
    language: '语言',
    close: '关闭',
    imageDetail: '产品信息',
    number: '编号',
    category: '品类',
    primaryColor: '主石颜色',
    images: '张',
    colorNote: '颜色',
    sectionHint: '展开后可直接浏览该类下所有图片',
  },
  en: {
    siteName: 'AzureVerse',
    archive: 'AzureVerse Archive',
    heroTitle: 'Let every visit open like a jewel blossom from Azure Jewelry.',
    heroText: 'Curated high jewelry selection.',
    browse: 'Browse Catalogue',
    heroMeta: 'Azure Jewelry',
    totalImages: 'Images',
    totalCategories: 'Categories',
    dominantCategory: 'Lead Category',
    scrollReveal: 'Scroll to reveal',
    brandReveal: 'Brand Reveal',
    revealTitle: 'Azure Jewelry',
    revealText: 'Fine Jewelry Catalogue',
    catalogue: 'Curated Catalogue',
    catalogueTitle: 'Expand each family, show its color notes, and keep every image card perfectly consistent.',
    search: 'Search',
    searchPlaceholder: 'Search by image ID, category, or color',
    quickColor: 'Quick Color Filter',
    currentResults: 'Now showing',
    imageUnit: 'images',
    viewDetail: 'Tap any image to enlarge',
    language: 'Language',
    close: 'Close',
    imageDetail: 'Product Detail',
    number: 'Number',
    category: 'Category',
    primaryColor: 'Stone Color',
    images: 'images',
    colorNote: 'Colors',
    sectionHint: 'Expand to browse every image inside this category',
  },
}

const categoryCopy = {
  戒指: {
    zh: { label: '戒指', note: '高频主推款与收藏级主石，适合快速锁定客户兴趣。', short: '戒指' },
    en: { label: 'Rings', note: 'Hero pieces and collector stones for fast client interest capture.', short: 'Rings' },
  },
  项链: {
    zh: { label: '项链', note: '适合做大图展示与佩戴联想，轮廓感最强。', short: '项链' },
    en: { label: 'Necklaces', note: 'Best for silhouette-led browsing and elevated styling imagination.', short: 'Necklaces' },
  },
  耳饰: {
    zh: { label: '耳饰', note: '适合成对比较与上身代入，节奏轻巧。', short: '耳饰' },
    en: { label: 'Earrings', note: 'Great for pair comparison and portrait-driven styling choices.', short: 'Earrings' },
  },
  手链: {
    zh: { label: '手链', note: '适合细节导向型客户，便于查看层次与结构。', short: '手链' },
    en: { label: 'Bracelets', note: 'Ideal for detail-focused viewing with layered structure appeal.', short: 'Bracelets' },
  },
  套装_组合图: {
    zh: { label: '套装 / 组合图', note: '保留搭配关系，便于整体式挑选。', short: '套装' },
    en: { label: 'Sets / Combined Looks', note: 'Preserves styling relationships for full-look selection.', short: 'Sets' },
  },
  胸针_别针: {
    zh: { label: '胸针 / 别针', note: '高珠点睛类素材，建议独立陈列。', short: '胸针' },
    en: { label: 'Brooches / Pins', note: 'Accent jewels best shown as their own refined group.', short: 'Brooches' },
  },
  裸石_宝石: {
    zh: { label: '裸石 / 宝石', note: '保留主石素材，方便后期定制沟通。', short: '裸石' },
    en: { label: 'Loose Stones / Gems', note: 'Stone-first assets kept for future custom conversations.', short: 'Gems' },
  },
}

const colorCopy = {
  蓝色: { zh: '蓝色', en: 'Blue' },
  黄色: { zh: '黄色', en: 'Yellow' },
  绿色: { zh: '绿色', en: 'Green' },
  红色: { zh: '红色', en: 'Red' },
  粉色: { zh: '粉色', en: 'Pink' },
  无明显彩钻: { zh: '无明显彩钻', en: 'No vivid color' },
  全部: { zh: '全部', en: 'All' },
}

function App() {
  const [language, setLanguage] = useState('zh')
  const [query, setQuery] = useState('')
  const [globalColor, setGlobalColor] = useState('全部')
  const [selectedId, setSelectedId] = useState(null)
  const [showBrandRail, setShowBrandRail] = useState(false)
  const [openSections, setOpenSections] = useState(() => new Set(['戒指', '项链']))
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const t = translations[language]

  useEffect(() => {
    document.title = 'AzureVerse'
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setShowBrandRail(window.scrollY > window.innerHeight * 0.58)
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
      const translatedCategory = `${categoryCopy[item.category]?.zh.label ?? item.category} ${categoryCopy[item.category]?.en.label ?? item.category}`.toLowerCase()
      const translatedColor = `${colorCopy[item.color]?.zh ?? item.color} ${colorCopy[item.color]?.en ?? item.color}`.toLowerCase()
      const matchesQuery =
        !deferredQuery ||
        item.id.toLowerCase().includes(deferredQuery) ||
        translatedCategory.includes(deferredQuery) ||
        translatedColor.includes(deferredQuery) ||
        item.originalFilename.toLowerCase().includes(deferredQuery)

      return matchesColor && matchesQuery
    })
  }, [deferredQuery, globalColor])

  const groupedCategories = useMemo(() => {
    return categoryOrder
      .map((category) => {
        const items = filteredGallery.filter((item) => item.category === category)
        const availableColors = colorOrder.filter((color) => items.some((item) => item.color === color))
        const byColor = availableColors.map((color) => ({
          color,
          items: items.filter((item) => item.color === color),
        }))

        return {
          category,
          total: items.length,
          leadImage: items[0]?.image,
          colors: availableColors,
          byColor,
        }
      })
      .filter((section) => section.total > 0)
  }, [filteredGallery])

  const selectedItem =
    filteredGallery.find((item) => item.id === selectedId) ?? gallery.find((item) => item.id === selectedId)

  const formatDisplayId = (id) => id.replace('AZJ-IMG-', 'AZJ-')

  const dominantLabel = stats.dominant?.[0]
    ? categoryCopy[stats.dominant[0]]?.[language].short ?? stats.dominant[0]
    : '—'

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
        <div className="hero-toolbar">
          <div className="hero-brand-pill">
            <img src="/az-monogram.png" alt="Azure Jewelry monogram" />
            <span>{t.siteName}</span>
          </div>
          <div className="language-switch" role="tablist" aria-label={t.language}>
            {['zh', 'en'].map((lang) => (
              <button
                key={lang}
                type="button"
                className={language === lang ? 'lang-pill is-active' : 'lang-pill'}
                onClick={() => setLanguage(lang)}
              >
                {lang === 'zh' ? '中文' : 'EN'}
              </button>
            ))}
          </div>
        </div>

        <div className="hero-flower" aria-hidden="true">
          <span className="flower-petal flower-petal-top"></span>
          <span className="flower-petal flower-petal-top-right"></span>
          <span className="flower-petal flower-petal-bottom-right"></span>
          <span className="flower-petal flower-petal-bottom"></span>
          <span className="flower-petal flower-petal-bottom-left"></span>
          <span className="flower-petal flower-petal-top-left"></span>
          <span className="flower-core">
            <img src="/az-monogram.png" alt="" />
          </span>
        </div>

        <div className="hero-copy">
          <p className="eyebrow">{t.archive}</p>
          <h1>{t.heroTitle}</h1>
          <p className="hero-text">{t.heroText}</p>
          <div className="hero-actions">
            <a href="#catalogue" className="primary-link">
              {t.browse}
            </a>
            <span className="hero-meta">{t.heroMeta}</span>
          </div>
        </div>

        <div className="hero-stats">
          <div className="metric-card glass-card">
            <span className="metric-label">{t.totalImages}</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="metric-card glass-card">
            <span className="metric-label">{t.totalCategories}</span>
            <strong>{stats.categories}</strong>
          </div>
          <div className="metric-card glass-card accent">
            <span className="metric-label">{t.dominantCategory}</span>
            <strong>{dominantLabel}</strong>
            <span className="metric-sub">{stats.dominant?.[1] ?? 0} {t.images}</span>
          </div>
        </div>

        <div className="hero-scroll-hint">
          <span>{t.scrollReveal}</span>
        </div>
      </section>

      <section className="logo-reveal-panel glass-section">
        <div className="logo-stack">
          <img src="/azure-jewelry-text.png" alt="Azure Jewelry" className="brand-title-image" />
          <p className="logo-caption">{t.revealText}</p>
        </div>
        <div className="logo-copy">
          <p className="eyebrow">{t.brandReveal}</p>
          <h2>{t.revealTitle}</h2>
          <p>{t.revealText}</p>
        </div>
      </section>

      <section className="control-panel glass-section" id="catalogue">
        <div className="control-header">
          <div>
            <p className="eyebrow">{t.catalogue}</p>
            <h2>{t.catalogueTitle}</h2>
          </div>
          <label className="search-box">
            <span>{t.search}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchPlaceholder}
            />
          </label>
        </div>

        <div className="global-filter-row">
          <span className="filter-label">{t.quickColor}</span>
          <div className="chip-row">
            {['全部', ...colorOrder].map((color) => (
              <button
                key={color}
                type="button"
                className={color === globalColor ? 'chip is-active' : 'chip'}
                onClick={() => startTransition(() => setGlobalColor(color))}
              >
                {colorCopy[color]?.[language] ?? color}
              </button>
            ))}
          </div>
          <div className="filter-summary">
            {t.currentResults} <strong>{filteredGallery.length}</strong> {t.imageUnit}
            <span className="summary-note">{t.viewDetail}</span>
          </div>
        </div>
      </section>

      <section className="accordion-list">
        {groupedCategories.map((section, index) => {
          const isOpen = openSections.has(section.category)
          const sectionText = categoryCopy[section.category]?.[language]

          return (
            <article
              key={section.category}
              className={isOpen ? 'category-accordion glass-section is-open' : 'category-accordion glass-section'}
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
                    <h3>{sectionText?.label ?? section.category}</h3>
                    <p>{sectionText?.note}</p>
                    <div className="section-colors">
                      <span className="section-colors-label">{t.colorNote}</span>
                      {section.colors.map((color) => (
                        <span key={`${section.category}-${color}`} className="section-color-chip">
                          {colorCopy[color]?.[language] ?? color}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="accordion-right">
                  <span>{section.total} {t.images}</span>
                  <span className="accordion-note">{t.sectionHint}</span>
                  <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
                </div>
              </button>

              <div className="accordion-content">
                <div className="accordion-preview">
                  {section.leadImage ? <img src={section.leadImage} alt={sectionText?.label ?? section.category} loading="lazy" /> : null}
                </div>

                <div className="accordion-groups">
                  {section.byColor.map((group) => (
                    <div key={`${section.category}-${group.color}`} className="color-group glass-card">
                      <div className="color-group-head">
                        <span className="color-badge">{colorCopy[group.color]?.[language] ?? group.color}</span>
                        <span className="color-count">{group.items.length} {t.images}</span>
                      </div>
                      <div className="gallery-grid">
                        {group.items.map((item) => (
                          <article
                            key={item.id}
                            className="gallery-card glass-card"
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
                                <span className="mood-tag">{colorCopy[item.color]?.[language] ?? item.color}</span>
                              </div>
                              <p className="gallery-meta">
                                {categoryCopy[item.category]?.[language].short ?? item.category}
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
            className="lightbox-panel glass-section"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selectedItem.id}
          >
            <button type="button" className="lightbox-close" onClick={() => setSelectedId(null)}>
              {t.close}
            </button>
            <div className="lightbox-image">
              <img src={selectedItem.image} alt={selectedItem.id} />
            </div>
            <div className="lightbox-meta">
              <p className="eyebrow">{t.imageDetail}</p>
              <h3>{formatDisplayId(selectedItem.id)}</h3>
              <ul>
                <li>{t.number}: {formatDisplayId(selectedItem.id)}</li>
                <li>{t.category}: {categoryCopy[selectedItem.category]?.[language].label ?? selectedItem.category}</li>
                <li>{t.primaryColor}: {colorCopy[selectedItem.color]?.[language] ?? selectedItem.color}</li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
