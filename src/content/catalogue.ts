import type { Category, CategoryText, Color, Language, TranslationCopy } from '../types/catalogue'

export const categoryOrder: Category[] = ['戒指', '项链', '耳饰', '手链', '套装_组合图', '胸针_别针', '裸石_宝石']

export const colorOrder: Exclude<Color, '全部'>[] = ['蓝色', '黄色', '绿色', '红色', '粉色', '白钻']

export const translations: Record<Language, TranslationCopy> = {
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
  蓝色: { zh: '蓝色', en: 'Blue' },
  黄色: { zh: '黄色', en: 'Yellow' },
  绿色: { zh: '绿色', en: 'Green' },
  红色: { zh: '红色', en: 'Red' },
  粉色: { zh: '粉色', en: 'Pink' },
  白钻: { zh: '白钻', en: 'White Diamond' },
  全部: { zh: '全部', en: 'All' },
}
