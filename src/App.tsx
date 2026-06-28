import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactElement } from 'react'
import './App.css'
import galleryData from './data/gallery.json'
import { categoryCopy, categoryOrder, colorCopy, colorOrder, translations } from './content/catalogue'
import type {
  Category,
  CategorySection,
  Color,
  GalleryItem,
  Language,
  TranslationCopy,
} from './types/catalogue'

const gallery = galleryData as GalleryItem[]

function formatDisplayId(id: string): string {
  return id.replace('AZJ-IMG-', 'AZJ-')
}

function useBodyScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) {
      return
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isLocked])
}

function filterGallery(items: GalleryItem[], color: Color, search: string): GalleryItem[] {
  return items.filter((item) => {
    const matchesColor = color === '全部' || item.color === color
    const translatedCategory = `${categoryCopy[item.category].zh.label} ${categoryCopy[item.category].en.label}`.toLowerCase()
    const translatedColor = `${colorCopy[item.color].zh} ${colorCopy[item.color].en}`.toLowerCase()
    const matchesSearch =
      search.length === 0 ||
      item.id.toLowerCase().includes(search) ||
      translatedCategory.includes(search) ||
      translatedColor.includes(search) ||
      item.originalFilename.toLowerCase().includes(search)

    return matchesColor && matchesSearch
  })
}

function buildSections(items: GalleryItem[]): CategorySection[] {
  return categoryOrder
    .map((category) => {
      const categoryItems = items.filter((item) => item.category === category)
      const colors = colorOrder.filter((color) => categoryItems.some((item) => item.color === color))

      return {
        category,
        total: categoryItems.length,
        leadImage: categoryItems[0]?.image,
        colors,
        byColor: colors.map((color) => ({
          color,
          items: categoryItems.filter((item) => item.color === color),
        })),
      }
    })
    .filter((section) => section.total > 0)
}

function App(): ReactElement {
  const [language, setLanguage] = useState<Language>('zh')
  const [query, setQuery] = useState('')
  const [globalColor, setGlobalColor] = useState<Color>('全部')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showBrandRail, setShowBrandRail] = useState(false)
  const [openSections, setOpenSections] = useState<Set<Category>>(new Set(['戒指', '项链']))
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const t: TranslationCopy = translations[language]

  useBodyScrollLock(selectedId !== null)

  useEffect(() => {
    document.title = 'AzureVerse'
  }, [])

  useEffect(() => {
    const onScroll = (): void => {
      setShowBrandRail(window.scrollY > window.innerHeight * 0.58)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!selectedId) {
      return
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setSelectedId(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedId])

  const stats = useMemo(() => {
    const counts = gallery.reduce<Record<Category, number>>((accumulator, item) => {
      accumulator[item.category] = (accumulator[item.category] ?? 0) + 1
      return accumulator
    }, {} as Record<Category, number>)

    const dominant = Object.entries(counts).sort((left, right) => right[1] - left[1])[0] as
      | [Category, number]
      | undefined

    return {
      total: gallery.length,
      categories: Object.keys(counts).length,
      dominant,
    }
  }, [])

  const filteredGallery = useMemo(
    () => filterGallery(gallery, globalColor, deferredQuery),
    [deferredQuery, globalColor],
  )

  const sections = useMemo(() => buildSections(filteredGallery), [filteredGallery])

  const selectedItem = useMemo(
    () => filteredGallery.find((item) => item.id === selectedId) ?? gallery.find((item) => item.id === selectedId) ?? null,
    [filteredGallery, selectedId],
  )

  const dominantLabel = stats.dominant ? categoryCopy[stats.dominant[0]][language].short : '—'

  const toggleSection = (category: Category): void => {
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

  const handleCardKeyDown = (
    event: ReactKeyboardEvent<HTMLElement>,
    imageId: string,
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelectedId(imageId)
    }
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
            {(['zh', 'en'] as const).map((lang) => (
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
            {(['全部', ...colorOrder] as const).map((color) => (
              <button
                key={color}
                type="button"
                className={color === globalColor ? 'chip is-active' : 'chip'}
                onClick={() => startTransition(() => setGlobalColor(color))}
              >
                {colorCopy[color][language]}
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
        {sections.map((section, index) => {
          const sectionText = categoryCopy[section.category][language]
          const isOpen = openSections.has(section.category)

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
                    <h3>{sectionText.label}</h3>
                    <p>{sectionText.note}</p>
                    <div className="section-colors">
                      <span className="section-colors-label">{t.colorNote}</span>
                      {section.colors.map((color) => (
                        <span key={`${section.category}-${color}`} className="section-color-chip">
                          {colorCopy[color][language]}
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
                  {section.leadImage ? (
                    <img src={section.leadImage} alt={sectionText.label} loading="lazy" />
                  ) : null}
                </div>

                <div className="accordion-groups">
                  {section.byColor.map((group) => (
                    <div key={`${section.category}-${group.color}`} className="color-group glass-card">
                      <div className="color-group-head">
                        <span className="color-badge">{colorCopy[group.color][language]}</span>
                        <span className="color-count">{group.items.length} {t.images}</span>
                      </div>
                      <div className="gallery-grid">
                        {group.items.map((item) => (
                          <article
                            key={item.id}
                            className="gallery-card glass-card"
                            onClick={() => setSelectedId(item.id)}
                            onKeyDown={(event) => handleCardKeyDown(event, item.id)}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="gallery-media">
                              <img src={item.image} alt={item.id} loading="lazy" />
                            </div>
                            <div className="gallery-body">
                              <div className="card-head">
                                <span className="image-id">{item.id}</span>
                                <span className="mood-tag">{colorCopy[item.color][language]}</span>
                              </div>
                              <p className="gallery-meta">{categoryCopy[item.category][language].short}</p>
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
                <li>{t.category}: {categoryCopy[selectedItem.category][language].label}</li>
                <li>{t.primaryColor}: {colorCopy[selectedItem.color][language]}</li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
