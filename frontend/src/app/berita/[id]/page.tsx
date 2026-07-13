"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SafeImage } from "@/components/ui/SafeImage";
import { NewspaperIcon } from "@/components/ui/icons";
import { api, apiUrl } from "@/lib/api";
import type { NewsArticle } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function NewsDetailPage() {
  const params = useParams<{ id: string }>();

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<NewsArticle>(`/api/news/${params.id}`)
      .then((data) => {
        if (!cancelled) setArticle(data);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-navy-700">
              Beranda
            </Link>
            <span className="mx-2">/</span>
            <Link href="/berita" className="hover:text-navy-700">
              Berita
            </Link>
          </nav>

          {loading && <p className="text-sm text-slate-500">Memuat artikel...</p>}
          {!loading && notFound && (
            <Card>
              <p className="text-sm text-slate-500">Artikel tidak ditemukan.</p>
              <Button href="/berita" variant="outline" className="mt-4">
                Kembali ke Berita
              </Button>
            </Card>
          )}

          {!loading && article && (
            <article>
              {article.category && (
                <span className="inline-flex items-center rounded-full bg-brand-orange-500 px-3 py-1 text-xs font-semibold text-navy-950">
                  {article.category}
                </span>
              )}
              <h1 className="mt-4 text-2xl font-extrabold text-navy-950 sm:text-3xl">
                {article.title}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {formatDate(article.published_at ?? article.created_at)}
              </p>

              <div className="mt-6 h-64 w-full overflow-hidden rounded-2xl bg-navy-50 sm:h-96">
                <SafeImage
                  src={article.thumbnail_url ? apiUrl(article.thumbnail_url) : null}
                  alt={article.title}
                  className="h-full w-full object-cover"
                  fallbackIcon={<NewspaperIcon className="h-14 w-14" />}
                />
              </div>

              <div className="mt-8 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {article.content}
              </div>

              <div className="mt-10">
                <Button href="/berita" variant="outline">
                  Kembali ke Berita
                </Button>
              </div>
            </article>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
