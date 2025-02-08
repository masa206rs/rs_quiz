import { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

declare global {
  type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode
  }

  type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout
  }

  // JSX
  declare namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
      h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
      h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
      p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
      button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
      main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      header: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      nav: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      footer: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      a: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>
      img: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
      br: React.DetailedHTMLProps<React.HTMLAttributes<HTMLBRElement>, HTMLBRElement>
      ul: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>
      li: React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>
      html: React.DetailedHTMLProps<React.HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>
      head: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>
      body: React.DetailedHTMLProps<React.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>
      link: React.DetailedHTMLProps<React.LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>
    }
  }
}

// Next.js App Router types
declare module "next" {
  interface Metadata {
    title?: string
    description?: string
    keywords?: string | string[]
    authors?: Array<{ name: string; url?: string }>
    openGraph?: {
      title?: string
      description?: string
      type?: string
      locale?: string
    }
    twitter?: {
      card?: string
      title?: string
      description?: string
    }
    viewport?: {
      width?: string
      initialScale?: number
      maximumScale?: number
    }
    robots?: {
      index?: boolean
      follow?: boolean
    }
  }
}

// Next.js Image types
declare module "next/image" {
  const Image: React.FC<ImageProps>
  export interface ImageProps extends Omit<React.HTMLAttributes<HTMLImageElement>, 'height' | 'width' | 'loading' | 'ref' | 'alt' | 'src' | 'srcSet'> {
    src: string
    alt: string
    width?: number
    height?: number
    fill?: boolean
    loader?: ImageLoader
    quality?: number
    priority?: boolean
    loading?: LoadingValue
    placeholder?: PlaceholderValue
    style?: React.CSSProperties
    sizes?: string
    className?: string
    onLoadingComplete?: OnLoadingComplete
    onLoad?: OnLoad
    onError?: OnError
    blurDataURL?: string
    layout?: LayoutValue
    objectFit?: ImageObjectFit
    objectPosition?: string
    lazyBoundary?: string
    lazyRoot?: React.RefObject<HTMLElement>
  }
  export default Image
}

// Next.js Link types
declare module "next/link" {
  import { LinkProps as NextLinkProps } from 'next/dist/client/link'
  import { PropsWithChildren } from 'react'

  export type LinkProps = PropsWithChildren<NextLinkProps>
  const Link: React.FC<LinkProps>
  export default Link
}

// Next.js Font types
declare module "next/font/google" {
  export interface FontOptions {
    subsets?: string[]
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
    weight?: string | number | Array<string | number>
    style?: 'normal' | 'italic'
  }

  export function Inter(options: FontOptions): {
    className: string
    style: { fontFamily: string }
  }
}

// Lucide React types
declare module 'lucide-react' {
  import { LucideIcon } from 'lucide-react'
  export const Car: LucideIcon
  export const Trophy: LucideIcon
  export const BookOpen: LucideIcon
  export const ArrowLeft: LucideIcon
  // 他のアイコンも必要に応じて追加
}

export {}