'use client'

import { useEffect, useRef, useState } from 'react'

// ─── Hook: useBlobUrl ─────────────────────────────────────────────
// Gera uma URL de preview pra um File e libera automaticamente quando
// o file muda ou o componente desmonta. Evita vazamento de memória
// causado por chamadas diretas a URL.createObjectURL() em cada render.
//
// Uso:
//   const url = useBlobUrl(file)
//   <img src={url ?? undefined} />
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
// Versão pra array de Files. Mantém um map File→URL estável e só
// cria/revoga quando a lista muda. Evita recriar URLs existentes.
//
// Uso:
//   const urls = useBlobUrls(form.fotos.map(f => f.file))
//   {urls.map(u => <img src={u} />)}
export function useBlobUrls(files: (File | null | undefined)[]): (string | null)[] {
  const cacheRef = useRef<Map<File, string>>(new Map())
  const [urls, setUrls] = useState<(string | null)[]>([])

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

    // Revoga URLs de files que sumiram da lista
    for (const [file, url] of cache.entries()) {
      if (!ativos.has(file)) {
        URL.revokeObjectURL(url)
        cache.delete(file)
      }
    }

    setUrls(novosUrls)
    // files é array novo a cada render; a comparação por length+refs é suficiente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.length, ...files])

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
