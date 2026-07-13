"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { EmptyState } from "@/components/ui/StatCard";
import { NewspaperIcon } from "@/components/ui/icons";
import { api, apiUrl } from "@/lib/api";
import type { NewsArticle } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 9;

function excerpt(content: string, length = 140) {
  const stripped = content.replace(/\s+/g, " ").trim();
  return stripped.length > length ? `${stripped.slice(0, length).trim()}...` : stripped;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api
      .get<NewsArticle[]>("/api/news")
      .then(setNews)
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(news.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => news.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [news, page]
  );
  const featured = page === 1 ? pageItems[0] : undefined;
  const gridItems = page === 1 ? pageItems.slice(1) : pageItems;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <div className="border-b border-navy-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-extrabold text-navy-950 sm:text-3xl">Berita & Pengumuman</h1>
            <p className="mt-1 text-sm text-slate-500">
              Informasi terkini seputar kebijakan ketenagakerjaan dan kegiatan.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {loading && <p className="py-10 text-center text-sm text-slate-500">Memuat berita...</p>}

          {!loading && news.length === 0 && (
            <EmptyState
              title="Belum ada berita"
              description="Belum ada berita atau pengumuman yang dipublikasikan."
            />
          )}

          {!loading && news.length > 0 && (
            <>
              {featured && (
                <Link
                  href={`/berita/${featured.id}`}
                  className="mb-8 block overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm shadow-navy-950/[0.03] transition-shadow hover:shadow-md"
                >
                  <div className="relative h-64 w-full bg-navy-50 sm:h-80">
                    {featured.category && (
                      <span className="absolute left-4 top-4 z-10 inline-flex items-center rounded-full bg-brand-orange-500 px-3 py-1 text-xs font-semibold text-navy-950">
                        {featured.category}
                      </span>
                    )}
                    <SafeImage
                      src={featured.thumbnail_url ? apiUrl(featured.thumbnail_url) : null}
                      alt={featured.title}
                      className="h-full w-full object-cover"
                      fallbackIcon={<NewspaperIcon className="h-14 w-14" />}
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-slate-500">
                      {formatDate(featured.published_at ?? featured.created_at)}
                    </p>
                    <h2 className="mt-2 text-xl font-extrabold text-navy-950">{featured.title}</h2>
                    <p className="mt-2 text-sm text-slate-500">{excerpt(featured.content, 200)}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600">
                      Baca Selengkapnya <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              )}

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gridItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/berita/${item.id}`}
                    className="flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm shadow-navy-950/[0.03] transition-shadow hover:shadow-md"
                  >
                    <div className="relative h-44 w-full bg-navy-50">
                      {item.category && (
                        <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full bg-brand-orange-500 px-2.5 py-1 text-xs font-semibold text-navy-950">
                          {item.category}
                        </span>
                      )}
                      <SafeImage
                        src={item.thumbnail_url ? apiUrl(item.thumbnail_url) : null}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        fallbackIcon={<NewspaperIcon className="h-8 w-8" />}
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <p className="text-xs text-slate-500">
                        {formatDate(item.published_at ?? item.created_at)}
                      </p>
                      <h3 className="text-sm font-bold text-navy-950">{item.title}</h3>
                      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600">
                        Baca Selengkapnya <span aria-hidden>→</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Sebelumnya
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                        p === page
                          ? "bg-navy-600 text-white"
                          : "border border-navy-100 text-navy-700 hover:bg-navy-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
