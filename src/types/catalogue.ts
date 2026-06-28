export type Language = 'zh' | 'en'

export type Category =
  | '戒指'
  | '项链'
  | '耳饰'
  | '手链'
  | '套装_组合图'
  | '胸针_别针'
  | '裸石_宝石'

export type Color =
  | '蓝色'
  | '黄色'
  | '绿色'
  | '红色'
  | '粉色'
  | '无明显彩钻'
  | '全部'

export interface GalleryItem {
  id: string
  title: string
  category: Category
  color: Exclude<Color, '全部'>
  suggestedColor: string
  originalFilename: string
  image: string
  mood: string
}

export interface TranslationCopy {
  siteName: string
  archive: string
  heroTitle: string
  heroText: string
  browse: string
  heroMeta: string
  totalImages: string
  totalCategories: string
  dominantCategory: string
  scrollReveal: string
  brandReveal: string
  revealTitle: string
  revealText: string
  catalogue: string
  catalogueTitle: string
  search: string
  searchPlaceholder: string
  quickColor: string
  currentResults: string
  imageUnit: string
  viewDetail: string
  language: string
  close: string
  imageDetail: string
  number: string
  category: string
  primaryColor: string
  images: string
  colorNote: string
  sectionHint: string
}

export interface CategoryText {
  label: string
  note: string
  short: string
}

export interface CategoryGroup {
  color: Exclude<Color, '全部'>
  items: GalleryItem[]
}

export interface CategorySection {
  category: Category
  total: number
  leadImage?: string
  colors: Exclude<Color, '全部'>[]
  byColor: CategoryGroup[]
}
