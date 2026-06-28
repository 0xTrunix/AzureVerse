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

  const runHeroSearch = (searchValue: string): void => {
    const matchingSections = buildSections(filterGallery(gallery, globalColor, searchValue.trim().toLowerCase()))
    setOpenSections(new Set(matchingSections.map((section) => section.category)))
    setOpenColorGroups(new Set(matchingSections.flatMap((section) => section.byColor.map((group) => `${section.category}-${group.color}`))))
    window.setTimeout(scrollToCatalogue, 80)
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

  const toggleColorGroup = (groupKey: string): void => {
    startTransition(() => {
      setOpenColorGroups((current) => {
        const next = new Set(current)
        if (next.has(groupKey)) {
          next.delete(groupKey)
        } else {
          next.add(groupKey)
        }
        return next
      })
    })
  }

  const jumpToColorGroup = (category: Category, color: Exclude<Color, '全部'>): void => {
    const groupKey = `${category}-${color}`
    setOpenSections((current) => new Set(current).add(category))
    setOpenColorGroups((current) => new Set(current).add(groupKey))
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

          return (
            <article
              key={section.category}
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
                  <div className="section-colors">
                    {section.colors.map((color) => (
                      <button
                        key={`${section.category}-${color}`}
                        type="button"
                        className="section-color-chip"
                        data-color={color}
                        onClick={(event) => {
                          event.stopPropagation()
                          jumpToColorGroup(section.category, color)
                        }}
                      >
                        {colorCopy[color][language]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="accordion-content">
                <div className="accordion-groups">
                  {section.byColor.map((group) => {
                    const groupKey = `${section.category}-${group.color}`
                    const isGroupOpen = openColorGroups.has(groupKey)

                    return (
                      <div
                        key={groupKey}
                        id={`color-${groupKey}`}
                        className={isGroupOpen ? 'color-group glass-card is-open' : 'color-group glass-card'}
                      >
                        <button
                          type="button"
                          className="color-group-head"
                          onClick={() => toggleColorGroup(groupKey)}
                          aria-expanded={isGroupOpen}
                        >
                          <span className="color-badge" data-color={group.color}>{colorCopy[group.color][language]}</span>
                          <span className="color-group-arrow" aria-hidden="true"></span>
                        </button>
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
