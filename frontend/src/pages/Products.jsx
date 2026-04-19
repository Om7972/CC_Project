import React from 'react';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { useProducts, useProductCategories, useRecommendations } from '../hooks/useApi';
import ProductCard from '../components/ProductCard';
import { LoadingSkeleton } from '../components/Loading';
import { useFilterStore } from '../store/filterStore';
import { useCartStore } from '../store/cartStore';
import { getBrowseHistory, pushBrowseProduct } from '../utils/browseHistory';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export const ProductsPage = () => {
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [quickView, setQuickView] = React.useState(null);
  const [showFilters, setShowFilters] = React.useState(true);
  const [recoKey, setRecoKey] = React.useState(0);

  const { filters, setFilter, clearFilters } = useFilterStore();
  const { addItem } = useCartStore();

  const debouncedSearch = useDebouncedValue(searchInput, 380);

  React.useEffect(() => {
    setFilter('search', debouncedSearch);
  }, [debouncedSearch, setFilter]);

  React.useEffect(() => {
    setPage(1);
  }, [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy,
    filters.featuredOnly,
    debouncedSearch,
  ]);

  const queryParams = React.useMemo(
    () => ({
      page,
      limit: 12,
      category: filters.category || undefined,
      search: filters.search || undefined,
      minPrice: filters.minPrice === '' ? undefined : filters.minPrice,
      maxPrice: filters.maxPrice === '' ? undefined : filters.maxPrice,
      sortBy: filters.sortBy,
      featured: filters.featuredOnly ? 'true' : undefined,
    }),
    [page, filters]
  );

  const { data, isLoading, isFetching } = useProducts(queryParams);
  const { data: catData } = useProductCategories();
  const browseHistory = React.useMemo(() => getBrowseHistory(), [recoKey]);
  const { data: recData, isLoading: recLoading } = useRecommendations(browseHistory);

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success('Added to cart!');
  };

  const products = data?.products || [];
  const pagination = data?.pagination || {};
  const categories = catData?.categories || [];

  const recProducts = recData?.products || [];

  const scrollRec = (dir) => {
    const el = document.getElementById('rec-strip');
    if (!el) return;
    el.scrollBy({ left: dir * 360, behavior: 'smooth' });
  };

  const activeFilterChips = [];
  if (filters.category) activeFilterChips.push({ key: 'category', label: filters.category });
  if (filters.minPrice !== '')
    activeFilterChips.push({
      key: 'minPrice',
      label: `Min ${formatCurrency(Number(filters.minPrice))}`,
    });
  if (filters.maxPrice !== '')
    activeFilterChips.push({
      key: 'maxPrice',
      label: `Max ${formatCurrency(Number(filters.maxPrice))}`,
    });
  if (filters.featuredOnly) activeFilterChips.push({ key: 'featuredOnly', label: 'Featured' });
  if (filters.search) activeFilterChips.push({ key: 'search', label: `"${filters.search}"` });

  return (
    <div className="min-h-screen py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="relative overflow-hidden rounded-[2rem] border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/80 px-8 py-12 shadow-2xl shadow-cyan-500/5">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <Sparkles className="h-3.5 w-3.5" />
                CloudMart catalog
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Browse top items with live filters
              </h1>
              <p className="text-lg text-slate-400">
                Dynamic search, categories, price range, sorting, featured picks, and personalized recommendations based on what you view — all with smooth motion and a polished storefront feel.
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-4 text-center sm:flex sm:gap-8">
              {[
                ['Smart filters', 'Live'],
                ['Recommendations', 'AI + cache'],
                ['Checkout', 'Stripe-ready'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-2xl border border-slate-700/80 bg-slate-950/50 px-5 py-4 backdrop-blur-sm"
                >
                  <dt className="text-xs uppercase tracking-widest text-slate-500">{k}</dt>
                  <dd className="mt-1 text-sm font-semibold text-cyan-300">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        {(recLoading || recProducts.length > 0) && (
          <section className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Recommended for you</h2>
                <p className="text-sm text-slate-500">Based on your browsing — refreshed with backend + optional Lambda + Redis.</p>
              </div>
              <div className="hidden sm:flex gap-2">
                <button
                  type="button"
                  onClick={() => scrollRec(-1)}
                  className="rounded-full border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"
                  aria-label="Scroll recommendations left"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRec(1)}
                  className="rounded-full border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"
                  aria-label="Scroll recommendations right"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div
              id="rec-strip"
              className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scroll-smooth snap-x snap-mandatory"
            >
              {recLoading && (
                <div className="h-64 min-w-[220px] animate-pulse rounded-3xl bg-slate-800/80" />
              )}
              {recProducts.map((product) => (
                <div key={product._id} className="min-w-[260px] max-w-[280px] snap-start shrink-0">
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    onView={() => {
                      pushBrowseProduct(product._id);
                      setRecoKey((k) => k + 1);
                      setQuickView(product);
                    }}
                    variant="compact"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 hover:border-cyan-500/40 lg:hidden"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide filters' : 'Show filters'}
          </button>
          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-slate-500">Active</span>
              {activeFilterChips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => {
                    if (c.key === 'category') setFilter('category', '');
                    else if (c.key === 'minPrice') setFilter('minPrice', '');
                    else if (c.key === 'maxPrice') setFilter('maxPrice', '');
                    else if (c.key === 'featuredOnly') setFilter('featuredOnly', false);
                    else if (c.key === 'search') {
                      setSearchInput('');
                      setFilter('search', '');
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-800/90 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
                >
                  {c.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  clearFilters();
                  setSearchInput('');
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300"
              >
                <RotateCcw className="h-3 w-3" />
                Reset all
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-8 transition-all lg:grid-cols-[280px_1fr]">
          <aside
            className={`space-y-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm ${
              showFilters ? 'block' : 'hidden'
            } lg:block`}
          >
            <div className="flex items-center gap-2 text-slate-200">
              <SlidersHorizontal className="h-5 w-5 text-cyan-400" />
              <span className="font-semibold">Filters</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500">Search</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 py-3 pl-11 pr-4 text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilter('category', e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-500">Min price</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => setFilter('minPrice', e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-500">Max price</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Any"
                  value={filters.maxPrice}
                  onChange={(e) => setFilter('maxPrice', e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500">Sort by</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilter('sortBy', e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest rated</option>
                <option value="popular">Most popular</option>
              </select>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3">
              <input
                type="checkbox"
                checked={filters.featuredOnly}
                onChange={(e) => setFilter('featuredOnly', e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500/30"
              />
              <span className="text-sm text-slate-200">Featured only</span>
            </label>
          </aside>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {pagination.total != null ? (
                  <>
                    Showing <span className="font-medium text-slate-300">{products.length}</span> of{' '}
                    <span className="font-medium text-slate-300">{pagination.total}</span> products
                    {isFetching && <span className="ml-2 text-cyan-400/80">Updating…</span>}
                  </>
                ) : null}
              </p>
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : products.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 py-20 text-center">
                <p className="text-lg text-slate-300">No products match these filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    clearFilters();
                    setSearchInput('');
                  }}
                  className="mt-4 rounded-full bg-cyan-500/20 px-6 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/30"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product, idx) => (
                  <div
                    key={product._id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${Math.min(idx * 55, 600)}ms`, animationFillMode: 'backwards' }}
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      onView={() => {
                        pushBrowseProduct(product._id);
                        setRecoKey((k) => k + 1);
                        setQuickView(product);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                {[...Array(pagination.pages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    type="button"
                    onClick={() => setPage(idx + 1)}
                    className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                      page === idx + 1
                        ? 'bg-cyan-400 text-slate-950 shadow-xl shadow-cyan-500/20'
                        : 'border border-slate-700 text-slate-300 hover:bg-slate-900/80'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {quickView && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in-up"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-view-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close"
            onClick={() => setQuickView(null)}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setQuickView(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-slate-800">
              <img
                src={quickView.thumbnail || quickView.images?.[0]?.url}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <h2 id="quick-view-title" className="mt-4 text-2xl font-bold text-white">
              {quickView.name}
            </h2>
            <p className="mt-2 text-sm text-slate-400">{quickView.vendorId?.storeName}</p>
            <p className="mt-4 text-slate-300 leading-relaxed">{quickView.description}</p>
            <div className="mt-6 flex items-center justify-between gap-4">
              <span className="text-2xl font-bold text-cyan-300">{formatCurrency(quickView.price)}</span>
              <button
                type="button"
                onClick={() => {
                  handleAddToCart(quickView);
                  setQuickView(null);
                }}
                disabled={quickView.stock === 0}
                className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 font-semibold text-slate-950 disabled:opacity-50"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
