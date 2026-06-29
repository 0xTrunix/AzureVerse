import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent, ReactElement } from 'react'
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
  return id
}

function thumbnailImage(id: string): string {
  return `/gallery-thumbs/${id}.webp?v=cover-20260629`
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '')
}

function categoryNeedles(category: Category): string[] {
  const copy = categoryCopy[category]
  const values = [
    category,
    copy.zh.label,
    copy.zh.short,
    copy.en.label,
    copy.en.short,
  ]

  if (category === '戒指') {
    values.push('ring')
  }

  if (category === '项链') {
    values.push('necklace')
  }

  if (category === '耳饰') {
    values.push('earring')
  }

  if (category === '手链') {
    values.push('bracelet')
  }

  if (category === '套装_组合图') {
    values.push('set', 'combined')
  }

  if (category === '胸针_别针') {
    values.push('brooch', 'pin')
  }

  if (category === '裸石_宝石') {
    values.push('gem', 'stone')
  }

  return values.map(normalizeText)
}

function colorNeedles(color: Exclude<Color, '全部'>): string[] {
  const copy = colorCopy[color]
  const plainColor: Record<Exclude<Color, '全部'>, string[]> = {
    蓝色: ['blue'],
    黄色: ['yellow'],
    绿色: ['green'],
    红色: ['red'],
    粉色: ['pink'],
    白钻: ['white'],
  }

  return [
    color,
    copy.zh,
    copy.en,
    ...plainColor[color],
  ].map(normalizeText)
}

function detectCategory(search: string): Category | null {
  const normalizedSearch = normalizeText(search)
  return categoryOrder.find((category) => (
    categoryNeedles(category).some((needle) => needle.length > 0 && normalizedSearch.includes(needle))
  )) ?? null
}

function detectColor(search: string): Exclude<Color, '全部'> | null {
  const normalizedSearch = normalizeText(search)
  return colorOrder.find((color) => (
    colorNeedles(color).some((needle) => needle.length > 0 && normalizedSearch.includes(needle))
  )) ?? null
}

function searchTerms(search: string): string[] {
  const normalizedSearch = normalizeText(search)
  if (normalizedSearch.length === 0) {
    return []
  }

  const terms = search
    .toLowerCase()
    .split(/\s+/)
    .map(normalizeText)
    .filter(Boolean)
  const detectedCategory = detectCategory(search)
  const detectedColor = detectColor(search)

  if (detectedCategory || detectedColor) {
    return [
      ...(detectedCategory ? categoryNeedles(detectedCategory).slice(0, 1) : []),
      ...(detectedColor ? colorNeedles(detectedColor).slice(1, 2) : []),
    ]
  }

  return terms.length > 0 ? terms : [normalizedSearch]
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
  const terms = searchTerms(search)

  return items.filter((item) => {
    const matchesColor = color === '全部' || item.color === color
    const searchableText = normalizeText([
      item.id,
      item.originalFilename,
      item.category,
      categoryCopy[item.category].zh.label,
      categoryCopy[item.category].zh.short,
      categoryCopy[item.category].en.label,
      categoryCopy[item.category].en.short,
      item.color,
      colorCopy[item.color].zh,
      colorCopy[item.color].en,
    ].join(' '))
    const matchesSearch = terms.length === 0 || terms.every((term) => searchableText.includes(term))

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
  const [isComposingSearch, setIsComposingSearch] = useState(false)
  const [globalColor, setGlobalColor] = useState<Color>('全部')
  const [activeCategory, setActiveCategory] = useState<Category | '全部'>('全部')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showBrandRail, setShowBrandRail] = useState(false)
  const [isMobileNav, setIsMobileNav] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const t: TranslationCopy = translations[language]

  useBodyScrollLock(selectedId !== null)

  useEffect(() => {
    document.title = 'AzureVerse'
  }, [])

  useEffect(() => {
    const onScroll = (): void => {
      setShowBrandRail(window.scrollY > window.innerHeight * 0.72)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 860px)')
    const syncMobileNav = (): void => {
      setIsMobileNav(mediaQuery.matches)
      if (!mediaQuery.matches) {
        setIsSidebarOpen(false)
      }
    }

    syncMobileNav()
    mediaQuery.addEventListener('change', syncMobileNav)
    return () => mediaQuery.removeEventListener('change', syncMobileNav)
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

  const filteredGallery = useMemo(
    () => filterGallery(gallery, globalColor, deferredQuery),
    [deferredQuery, globalColor],
  )

  const sections = useMemo(() => buildSections(filteredGallery), [filteredGallery])

  const visibleGallery = useMemo(
    () => activeCategory === '全部'
      ? filteredGallery
      : filteredGallery.filter((item) => item.category === activeCategory),
    [activeCategory, filteredGallery],
  )

  const selectedItem = useMemo(
    () => filteredGallery.find((item) => item.id === selectedId) ?? gallery.find((item) => item.id === selectedId) ?? null,
    [filteredGallery, selectedId],
  )

  const scrollToCatalogue = (): void => {
    const catalogue = document.getElementById('catalogue')
    if (!catalogue) {
      return
    }

    const targetTop = catalogue.getBoundingClientRect().top + window.scrollY - 16
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
  }

  const scrollToSearch = (): void => {
    const searchInput = document.getElementById('hero-search')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.setTimeout(() => {
      if (searchInput instanceof HTMLInputElement) {
        searchInput.focus({ preventScroll: true })
      }
    }, 420)
  }

  const handleBrandRailClick = (): void => {
    if (selectedItem) {
      setSelectedId(null)
      return
    }

    scrollToSearch()
  }

  const handleMobileMenuToggle = (): void => {
    setIsSidebarOpen((current) => !current)
  }

  const runHeroSearch = (searchValue: string): void => {
    const search = searchValue.trim().toLowerCase()
    const detectedCategory = detectCategory(search)
    const detectedColor = detectColor(search)
    const nextColor: Color = detectedColor ?? '全部'

    setQuery(searchValue)
    setGlobalColor(nextColor)
    setActiveCategory(detectedCategory ?? '全部')
    window.setTimeout(() => {
      scrollToCatalogue()
    }, 120)
  }

  useEffect(() => {
    if (isComposingSearch || normalizeText(query).length < 2) {
      return
    }

    const timer = window.setTimeout(() => {
      runHeroSearch(query)
    }, 650)

    return () => window.clearTimeout(timer)
  }, [isComposingSearch, query])

  const handleHeroSearchSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const form = event.currentTarget
    const input = form.elements.namedItem('hero-search')
    runHeroSearch(input instanceof HTMLInputElement ? input.value : query)
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

  const handleCategorySelect = (category: Category | '全部'): void => {
    startTransition(() => {
      setActiveCategory(category)
      setGlobalColor('全部')
      setIsSidebarOpen(false)
    })
  }

  const isBrandRailVisible = showBrandRail || Boolean(selectedItem) || isMobileNav
  const brandRailLabel = selectedItem
    ? language === 'zh' ? '退出图片详情' : 'Close image detail'
    : language === 'zh' ? '返回顶部搜索' : 'Back to search'
  const mobileMenuLabel = isSidebarOpen
    ? language === 'zh' ? '收起品类导航' : 'Close category menu'
    : language === 'zh' ? '打开品类导航' : 'Open category menu'

  const renderCategorySidebar = (className: string): ReactElement => (
    <aside className={`category-sidebar ${className}`} aria-label={language === 'zh' ? '品类导航' : 'Category navigation'}>
      <div className="sidebar-kicker">{t.catalogue}</div>
      <button
        type="button"
        className={activeCategory === '全部' ? 'sidebar-link is-active' : 'sidebar-link'}
        onClick={() => handleCategorySelect('全部')}
      >
        <span>{language === 'zh' ? '全部' : 'All'}</span>
        <em>{filteredGallery.length}</em>
      </button>
      {categoryOrder.map((category) => {
        const section = sections.find((item) => item.category === category)
        const sectionText = categoryCopy[category][language]

        return (
          <button
            key={category}
            type="button"
            className={activeCategory === category ? 'sidebar-link is-active' : 'sidebar-link'}
            onClick={() => handleCategorySelect(category)}
          >
            <span>{sectionText.label}</span>
            <em>{section?.total ?? 0}</em>
          </button>
        )
      })}
    </aside>
  )

  return (
    <div className={isSidebarOpen ? 'page-shell sidebar-is-open' : 'page-shell'}>
      <button
        type="button"
        className={isBrandRailVisible ? 'brand-rail is-visible' : 'brand-rail'}
        onClick={handleBrandRailClick}
        aria-label={brandRailLabel}
      >
        <img src="/az-monogram.png" alt="Azure Jewelry monogram" className="brand-rail-monogram" />
      </button>

      {isMobileNav ? (
        <button
          type="button"
          className={isSidebarOpen ? 'mobile-menu-toggle is-open' : 'mobile-menu-toggle'}
          onClick={handleMobileMenuToggle}
          aria-label={mobileMenuLabel}
          aria-expanded={isSidebarOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      ) : null}

      {isMobileNav ? renderCategorySidebar('mobile-category-sidebar') : null}

      <div className="content-shell">
      <section className="hero-stage">
        <div className="hero-gradient-overlay" aria-hidden="true"></div>
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

        <div className="hero-content">
          <img src="/azure-jewelry-text.png" alt="Azure Jewelry" className="hero-logo-mark" />
          <form className="hero-search-form" onSubmit={handleHeroSearchSubmit}>
            <label className="sr-only" htmlFor="hero-search">{t.search}</label>
            <input
              id="hero-search"
              name="hero-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onCompositionStart={() => setIsComposingSearch(true)}
              onCompositionEnd={(event) => {
                setIsComposingSearch(false)
                runHeroSearch(event.currentTarget.value)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  runHeroSearch(event.currentTarget.value)
                }
              }}
              placeholder={t.heroSearchPlaceholder}
            />
          </form>
        </div>
      </section>

      <section className="catalogue-shell glass-section" id="catalogue">
        {renderCategorySidebar('desktop-category-sidebar')}

        <div className="catalogue-main">
          <div className="global-filter-row">
            <div className="chip-row">
              {colorOrder.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={color === globalColor ? 'chip is-active' : 'chip'}
                  onClick={() => startTransition(() => setGlobalColor(color))}
                  data-color={color}
                >
                  {colorCopy[color][language]}
                </button>
              ))}
            </div>
          </div>

          <div className="catalogue-gallery glass-card">
            {visibleGallery.length > 0 ? (
              <div className="gallery-grid">
                {visibleGallery.map((item, index) => (
                  <article
                    key={item.id}
                    className="gallery-card glass-card"
                    onClick={() => setSelectedId(item.id)}
                    onKeyDown={(event) => handleCardKeyDown(event, item.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="gallery-media">
                      <img
                        src={thumbnailImage(item.id)}
                        alt={item.id}
                        loading={index < 9 ? 'eager' : 'lazy'}
                        decoding="async"
                        fetchPriority={index < 4 ? 'high' : 'auto'}
                      />
                    </div>
                    <div className="gallery-body">
                      <div className="card-head">
                        <span className="image-id">{item.id}</span>
                        <span className="mood-tag" data-color={item.color}>{colorCopy[item.color][language]}</span>
                      </div>
                      <p className="gallery-meta">{categoryCopy[item.category][language].short}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                {language === 'zh' ? '暂时没有匹配的图片，可以切换品类或颜色。' : 'No matching images yet. Try another category or color.'}
              </div>
            )}
          </div>
        </div>
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
    </div>
  )
}

export default App
