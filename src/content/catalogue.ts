import type { Category, CategoryText, Color, Language, TranslationCopy } from '../types/catalogue'

export const categoryOrder: Category[] = ['戒指', '项链', '耳饰', '手链', '套装_组合图', '胸针_别针', '裸石_宝石']

export const colorOrder: Exclude<Color, '全部'>[] = ['蓝色', '黄色', '绿色', '红色', '粉色', '白钻']

export const translations: Record<Language, TranslationCopy> = {
  zh: {
    siteName: 'AzureVerse',
    heroSearchPlaceholder: '蓝宝石戒指、项链、白宝石...',
    catalogue: 'Collections',
    catalogueTitle: '珠宝图册',
    search: '搜索',
    searchPlaceholder: '编号、品类或颜色',
    quickColor: '颜色',
    language: '语言',
    close: '关闭',
    imageDetail: '产品信息',
    number: '编号',
    category: '品类',
    primaryColor: '主石颜色',
    colorNote: '颜色',
  },
  en: {
    siteName: 'AzureVerse',
    heroSearchPlaceholder: 'Blue gemstones, necklaces, white gemstones...',
    catalogue: 'Collections',
    catalogueTitle: 'Fine Jewelry Catalogue',
    search: 'Search',
    searchPlaceholder: 'Number, category, or color',
    quickColor: 'Color',
    language: 'Language',
    close: 'Close',
    imageDetail: 'Product Detail',
    number: 'Number',
    category: 'Category',
    primaryColor: 'Stone Color',
    colorNote: 'Colors',
  },
}

export const categoryCopy: Record<Category, Record<Language, CategoryText>> = {
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

export const colorCopy: Record<Color, Record<Language, string>> = {
  蓝色: { zh: '蓝宝石', en: 'Blue Gemstone' },
  黄色: { zh: '黄宝石', en: 'Yellow Gemstone' },
  绿色: { zh: '绿宝石', en: 'Green Gemstone' },
  红色: { zh: '红宝石', en: 'Red Gemstone' },
  粉色: { zh: '粉宝石', en: 'Pink Gemstone' },
  白钻: { zh: '白宝石', en: 'White Gemstone' },
  全部: { zh: '全部', en: 'All' },
}
