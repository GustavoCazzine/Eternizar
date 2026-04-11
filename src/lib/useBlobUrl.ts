'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

// ─── Hook: useBlobUrl ─────────────────────────────────────────────
// Gera uma URL de preview pra um File e libera automaticamente quando
// o file muda ou o componente desmonta.
export function useBlobUrl(file: File | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setUrl(null)
      return
    }
    const objUrl = URL.createObjectURL(file)
    setUrl(objUrl)
    return () => {
      URL.revokeObjectURL(objUrl)
    }
  }, [file])

  return url
}

// ─── Hook: useBlobUrls ────────────────────────────────────────────
// Versão pra array de Files. Mantém cache estável e revoga URLs
// quando files saem da lista. Usa uma chave string derivada dos
// files (size + lastModified) como dep — array de tamanho 1 fixo,
// obedecendo a regra do useEffect.
export function useBlobUrls(files: (File | null | undefined)[]): (string | null)[] {
  const cacheRef = useRef<Map<File, string>>(new Map())

  // Chave estável que muda quando a lista muda de verdade.
  // Files iguais (mesma referência) produzem mesma chave → no-op.
  const chave = useMemo(
    () =>
      files
        .map(f => (f ? `${f.name}:${f.size}:${f.lastModified}` : 'null'))
        .join('|'),
    [files]
  )

  const [urls, setUrls] = useState<(string | null)[]>(() => files.map(() => null))

  useEffect(() => {
    const cache = cacheRef.current
    const novosUrls: (string | null)[] = []
    const ativos = new Set<File>()

    for (const file of files) {
      if (!file) {
        novosUrls.push(null)
        continue
      }
      ativos.add(file)
      let u = cache.get(file)
      if (!u) {
        u = URL.createObjectURL(file)
        cache.set(file, u)
      }
      novosUrls.push(u)
    }

    // Revoga URLs de files que sumiram
    for (const [file, url] of cache.entries()) {
      if (!ativos.has(file)) {
        URL.revokeObjectURL(url)
        cache.delete(file)
      }
    }

    setUrls(novosUrls)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave])

  // Cleanup final no unmount
  useEffect(() => {
    const cache = cacheRef.current
    return () => {
      for (const url of cache.values()) URL.revokeObjectURL(url)
      cache.clear()
    }
  }, [])

  return urls
}
