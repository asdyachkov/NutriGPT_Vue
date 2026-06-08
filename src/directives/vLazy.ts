import type { Directive, DirectiveBinding } from 'vue'

/**
 * v-lazy — ленивая загрузка изображений через IntersectionObserver.
 * Использование:
 *   <img v-lazy="url" />          — url подставится в src при появлении в вьюпорте
 *   <img v-lazy="{ src, loading }" alt="..." />
 *
 * Добавляет классы: .lazy-loading (пока грузится), .lazy-loaded (успех),
 * .lazy-error (ошибка).
 */

type LazyValue = string | { src: string; placeholder?: string }

interface LazyElement extends HTMLImageElement {
  _lazyObserver?: IntersectionObserver
}

function getSrc(value: LazyValue): string {
  if (typeof value === 'string') return value
  return value?.src ?? ''
}

function getPlaceholder(value: LazyValue): string | undefined {
  if (typeof value === 'object' && value !== null) return value.placeholder
  return undefined
}

const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

function loadImage(el: LazyElement, src: string) {
  if (!src) return
  el.classList.add('lazy-loading')

  const img = new Image()
  img.onload = () => {
    el.src = src
    el.classList.remove('lazy-loading')
    el.classList.add('lazy-loaded')
  }
  img.onerror = () => {
    el.classList.remove('lazy-loading')
    el.classList.add('lazy-error')
    // Сообщаем родительскому элементу об ошибке (используется LazyImage)
    el.dispatchEvent(new CustomEvent('lazy-error', { bubbles: true }))
  }
  img.src = src
}

export const vLazy: Directive<LazyElement, LazyValue> = {
  mounted(el, binding) {
    const src = getSrc(binding.value)
    const placeholder = getPlaceholder(binding.value) || TRANSPARENT_PIXEL

    // Показываем плейсхолдер, чтобы избежать layout shift
    if (!el.src || el.src === window.location.href) {
      el.src = placeholder
    }

    // Если IntersectionObserver недоступен — грузим сразу
    if (typeof IntersectionObserver === 'undefined') {
      loadImage(el, src)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            loadImage(el, src)
            observer.unobserve(el)
            observer.disconnect()
            el._lazyObserver = undefined
          }
        }
      },
      { rootMargin: '100px 0px', threshold: 0.01 }
    )

    observer.observe(el)
    el._lazyObserver = observer
  },

  updated(el, binding: DirectiveBinding<LazyValue>) {
    const newSrc = getSrc(binding.value)
    const oldSrc = getSrc(binding.oldValue as LazyValue)
    if (newSrc && newSrc !== oldSrc) {
      el.classList.remove('lazy-loaded', 'lazy-error')
      loadImage(el, newSrc)
    }
  },

  beforeUnmount(el) {
    if (el._lazyObserver) {
      el._lazyObserver.disconnect()
      el._lazyObserver = undefined
    }
  },
}

export default vLazy
