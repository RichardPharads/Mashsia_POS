import { useEffect, useMemo, useState } from "react";
import { AppSidebar } from "../components/App-Sidebar";
import ProductGrid from "../components/ProductGrid";
import CartSidebar from "../components/CartSidebar";
import TopBar from "../components/TopBar";
import { apiService } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { usePOSStore } from "../store/posStore";
import type { Product } from "../types";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const {
    categories,
    products,
    selectedCategory,
    setCategories,
    setProducts,
    setSelectedCategory,
    isLoading,
    setLoading,
    cart,
  } = usePOSStore();

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setFilteredProducts(products);
      return;
    }

    setFilteredProducts(
      products.filter((product) => product.categoryId === selectedCategory),
    );
  }, [products, selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedCategories, fetchedProducts] = await Promise.all([
        apiService.getCategories(),
        apiService.getProducts(),
      ]);
      setCategories(fetchedCategories);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const totalStock = products.reduce(
      (sum, product) => sum + (product.stockQuantity ?? 0),
      0,
    );
    const cartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    return {
      totalProducts: products.length,
      totalStock,
      cartItems,
    };
  }, [products, cart]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="flex h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar user={user} />

          <main className="flex flex-1 gap-4 overflow-hidden px-4 pb-4">
            <section className="flex flex-1 flex-col gap-4 overflow-hidden mt-2">
              <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                <CategorySelector
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelect={setSelectedCategory}
                />
              </div>

              <div className="flex flex-1 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/70">
                <ProductGrid
                  products={filteredProducts}
                  isLoading={isLoading}
                />
              </div>
            </section>

            <aside className="hidden w-80 shrink-0 lg:block">
              <CartSidebar />
            </aside>
          </main>
        </div>
      </div>
    </div>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

type CategorySelectorProps = {
  categories: Array<{ id: string; name: string }>;
  selectedCategory: string | null;
  onSelect: (value: string | null) => void;
};

function CategorySelector({
  categories,
  selectedCategory,
  onSelect,
}: CategorySelectorProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-200">Categories</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <CategoryButton
          label="All"
          active={selectedCategory === null}
          onClick={() => onSelect(null)}
        />
        {categories.map((category) => (
          <CategoryButton
            key={category.id}
            label={category.name}
            active={selectedCategory === category.id}
            onClick={() => onSelect(category.id)}
          />
        ))}
      </div>
    </div>
  );
}

type CategoryButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function CategoryButton({ label, active, onClick }: CategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
        active
          ? "border-slate-200 bg-slate-200 text-slate-900"
          : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );
}
