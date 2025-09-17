import { useState, useEffect, useCallback, useRef } from "react";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Loader2, SlidersHorizontal, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  sold: number;
  discount?: number;
  category?: string;
  views?: number;
}

const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // --- ACTIVE (đang áp dụng để fetch) ---
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minDiscount, setMinDiscount] = useState<string>("");
  const [sort, setSort] = useState<
    "popular" | "price_asc" | "price_desc" | "newest"
  >("popular");

  // --- DRAFT (người dùng đang nhập/chọn) ---
  const [qDraft, setQDraft] = useState("");
  const [categoryDraft, setCategoryDraft] = useState<string>("");
  const [minPriceDraft, setMinPriceDraft] = useState<string>("");
  const [maxPriceDraft, setMaxPriceDraft] = useState<string>("");
  const [minDiscountDraft, setMinDiscountDraft] = useState<string>("");
  const [sortDraft, setSortDraft] = useState<
    "popular" | "price_asc" | "price_desc" | "newest"
  >("popular");

  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const buildUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set("page", String(pageNum));
    params.set("limit", "8");
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minDiscount) params.set("minDiscount", minDiscount);
    if (sort) {
      params.set("sort", sort);
      // console.log("FE check: ", sort);
    }
    return `http://localhost:4000/api/products/search?${params.toString()}`;
  };

  const loadProducts = useCallback(
    async (pageNum: number, reset = false) => {
      try {
        setLoading(true);
        // hủy request cũ nếu còn
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch(buildUrl(pageNum), {
          signal: controller.signal,
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status} - ${text}`);
        }
        const data = await res.json();
        console.log("FE check data:", data);
        if (reset || pageNum === 1) {
          setProducts(data.products || []);
        } else {
          setProducts((prev) => [...prev, ...(data.products || [])]);
        }
        setHasMore(Boolean(data.hasMore));
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name === "AbortError") return;
          console.error("❌ Lỗi khi load sản phẩm:", err.message);
        } else {
          console.error("❌ Lỗi khi load sản phẩm:", err);
        }
      } finally {
        setLoading(false);
      }
    },
    [q, category, minPrice, maxPrice, minDiscount, sort]
  );

  // Lần đầu + khi ACTIVE filter đổi → load trang 1
  useEffect(() => {
    loadProducts(1, true);
    setPage(1);
  }, [loadProducts]);

  // Nút ÁP DỤNG: copy draft -> active rồi fetch
  const applyFilters = () => {
    setQ(qDraft.trim());
    setCategory(categoryDraft);
    setMinPrice(minPriceDraft);
    setMaxPrice(maxPriceDraft);
    setMinDiscount(minDiscountDraft);
    setSort(sortDraft);
    // useEffect sẽ tự fetch do deps thay đổi
    setShowMobileFilter(false);
  };

  const resetFilters = () => {
    setQDraft("");
    setCategoryDraft("");
    setMinPriceDraft("");
    setMaxPriceDraft("");
    setMinDiscountDraft("");
    setSortDraft("popular");

    setQ("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setMinDiscount("");
    setSort("popular");

    loadProducts(1, true);
    setPage(1);
    setShowMobileFilter(false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage);
    }
  };

  // Sidebar filter UI (dùng lại cho desktop & mobile)
  const FilterForm = (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Tìm kiếm</label>
        <input
          className="w-full border px-3 py-2 rounded-md"
          placeholder="Nhập từ khóa…"
          value={qDraft}
          onChange={(e) => setQDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Danh mục</label>
        <select
          title="category"
          className="w-full border px-3 py-2 rounded-md"
          value={categoryDraft}
          onChange={(e) => setCategoryDraft(e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          <option value="electronics">Điện tử</option>
          <option value="fashion">Thời trang</option>
          <option value="home">Nhà cửa</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Giá từ</label>
          <input
            className="w-full border px-3 py-2 rounded-md"
            placeholder="0"
            inputMode="numeric"
            value={minPriceDraft}
            onChange={(e) => setMinPriceDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Giá đến</label>
          <input
            className="w-full border px-3 py-2 rounded-md"
            placeholder="∞"
            inputMode="numeric"
            value={maxPriceDraft}
            onChange={(e) => setMaxPriceDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Khuyến mãi tối thiểu (%)</label>
        <input
          className="w-full border px-3 py-2 rounded-md"
          placeholder="VD: 10"
          inputMode="numeric"
          value={minDiscountDraft}
          onChange={(e) => setMinDiscountDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Sắp xếp</label>
        <select
          title="sort"
          className="w-full border px-3 py-2 rounded-md"
          value={sortDraft}
          onChange={(e) =>
            setSortDraft(
              e.target.value as
                | "popular"
                | "price_asc"
                | "price_desc"
                | "newest"
            )
          }
        >
          <option value="popular">Phổ biến</option>
          <option value="price_asc">Giá thấp → cao</option>
          <option value="price_desc">Giá cao → thấp</option>
          <option value="newest">Mới nhất</option>
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <Button onClick={applyFilters} className="flex-1">
          Áp dụng
        </Button>
        <Button onClick={resetFilters} variant="outline" className="flex-1">
          Xóa lọc
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header + nút mở filter trên mobile */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sản phẩm</h2>
        <Button
          onClick={() => setShowMobileFilter(true)}
          variant="outline"
          className="lg:hidden inline-flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Bộ lọc
        </Button>
      </div>

      {/* Layout 2 cột: Sidebar trái (sticky) + Content phải */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-4 rounded-xl border p-4">
            <div className="pb-2 mb-3 border-b">
              <div className="text-base font-semibold">Bộ lọc</div>
              <p className="text-sm text-muted-foreground">
                Thu hẹp phạm vi tìm kiếm của bạn
              </p>
            </div>
            {FilterForm}
          </div>
        </aside>

        {/* Content phải */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {!loading && hasMore && (
            <div className="flex justify-center py-8">
              <Button
                onClick={loadMore}
                variant="outline"
                className="bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
                Xem thêm sản phẩm
              </Button>
            </div>
          )}

          {!hasMore && (
            <div className="text-center py-8 text-muted-foreground">
              Đã hiển thị tất cả sản phẩm
            </div>
          )}
        </section>
      </div>

      {/* Drawer mobile filter */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileFilter(false)}
          />
          {/* panel */}
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-[360px] bg-white dark:bg-neutral-900 border-r p-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="text-base font-semibold">Bộ lọc</div>
              <button
                className="rounded-md p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setShowMobileFilter(false)}
                aria-label="Đóng bộ lọc"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="pt-4">{FilterForm}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
