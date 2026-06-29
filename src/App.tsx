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
  const [globalColor, setGlobalColor] = useState<Color>('全部')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showBrandRail, setShowBrandRail] = useState(false)
  const [openSections, setOpenSections] = useState<Set<Category>>(new Set())
  const [openColorGroups, setOpenColorGroups] = useState<Set<string>>(new Set())
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const t: TranslationCopy = translations[language]
  const isColorFiltered = globalColor !== '全部'

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

  const scrollToCategory = (category: Category): void => {
    const section = document.getElementById(`category-${category}`)
    if (!section) {
      scrollToCatalogue()
      return
    }

    const targetTop = section.getBoundingClientRect().top + window.scrollY - 18
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
  }

  const runHeroSearch = (searchValue: string): void => {
    const search = searchValue.trim().toLowerCase()
    const detectedColor = detectColor(search)
    const nextColor: Color = detectedColor ?? '全部'
    const matchingSections = buildSections(filterGallery(gallery, nextColor, search))
    const firstCategory = matchingSections[0]?.category

    setQuery(searchValue)
    setGlobalColor(nextColor)
    setOpenSections(new Set(matchingSections.map((section) => section.category)))
    setOpenColorGroups(new Set())
    window.setTimeout(() => {
      if (firstCategory) {
        scrollToCategory(firstCategory)
      } else {
        scrollToCatalogue()
      }
    }, 120)
  }

  const handleHeroSearchSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const form = event.currentTarget
    const input = form.elements.namedItem('hero-search')
    runHeroSearch(input instanceof HTMLInputElement ? input.value : query)
  }

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

  const jumpToColorGroup = (category: Category, color: Exclude<Color, '全部'>): void => {
    const groupKey = `${category}-${color}`
    setOpenSections((current) => new Set(current).add(category))
    setOpenColorGroups(new Set([groupKey]))
    window.setTimeout(() => {
      document.getElementById(`color-${groupKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
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
      </div>

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
            <label className="hero-search-label" htmlFor="hero-search">{t.search}</label>
            <input
              id="hero-search"
              name="hero-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
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

      <section className="control-panel glass-section" id="catalogue">
        <div className="control-header">
          <div>
            <p className="eyebrow">{t.catalogue}</p>
            <h2>{t.catalogueTitle}</h2>
          </div>
        </div>

        <div className="global-filter-row">
          <div className="chip-row">
            {(['全部', ...colorOrder] as const).map((color) => (
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
      </section>

      <section className="accordion-list">
        {sections.map((section) => {
          const sectionText = categoryCopy[section.category][language]
          const isOpen = openSections.has(section.category)
          const visibleSectionItems = section.byColor.flatMap((group) => group.items)

          return (
            <article
              key={section.category}
              id={`category-${section.category}`}
              className={isOpen ? 'category-accordion glass-section is-open' : 'category-accordion glass-section'}
            >
              <div className="accordion-trigger">
                <div className="accordion-left">
                  <button
                    type="button"
                    className="category-heading"
                    onClick={() => toggleSection(section.category)}
                    aria-expanded={isOpen}
                  >
                    <h3>{sectionText.label}</h3>
                    <span className="category-arrow" aria-hidden="true"></span>
                  </button>
                </div>
              </div>

              <div className="accordion-content">
                {isColorFiltered ? (
                  <div className="direct-gallery-panel glass-card">
                    <div className="gallery-grid">
                      {visibleSectionItems.map((item) => (
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
                              <span className="mood-tag" data-color={item.color}>{colorCopy[item.color][language]}</span>
                            </div>
                            <p className="gallery-meta">{categoryCopy[item.category][language].short}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="accordion-groups">
                    <div className="section-colors">
                      {section.colors.map((color) => (
                        <button
                          key={`${section.category}-${color}`}
                          type="button"
                          className="section-color-chip"
                          data-color={color}
                          onClick={() => jumpToColorGroup(section.category, color)}
                        >
                          {colorCopy[color][language]}
                        </button>
                      ))}
                    </div>
                    {section.byColor.map((group) => {
                      const groupKey = `${section.category}-${group.color}`
                      const isGroupOpen = openColorGroups.has(groupKey)

                      if (!isGroupOpen) {
                        return null
                      }

                      return (
                        <div
                          key={groupKey}
                          id={`color-${groupKey}`}
                          className={isGroupOpen ? 'color-group glass-card is-open' : 'color-group glass-card'}
                        >
                          <div className="gallery-scroll">
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
                                      <span className="mood-tag" data-color={item.color}>{colorCopy[item.color][language]}</span>
                                    </div>
                                    <p className="gallery-meta">{categoryCopy[item.category][language].short}</p>
                                  </div>
                                </article>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
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
    </div>
  )
}

export default App
