import BrandSelection from '@/components/search-category/BrandSelection';
import FilterModal from '@/components/search-category/FilterModal';
import ProductGrid from '@/components/search-category/ProductGrid';
import SearchHeader from '@/components/search-category/SearchHeader';
import SortBar from '@/components/search-category/SortBar';
import { Box, SafeAreaView } from '@/components/ui';
import { categoryBrandService } from '@/services/categoryBrand.service';
import { filterCriteriaService } from '@/services/filterCriteria.service';
import { productService } from '@/services/product.service';
import type { Brand } from '@/types/brand.type';
import type { FilterCriteria } from '@/types/filterCriteria.type';
import type { Product } from '@/types/product.type';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';

// --- Types & Interfaces ---
interface SearchFilters {
  brands?: number[];
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  filterValues?: number[];
}

type SortType = 'popular' | 'newest' | 'best_selling' | 'price_asc' | 'price_desc';

// --- Main Component ---
export default function SearchCategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const slug = params.slug as string | undefined;

  // UI States
  const [searchText, setSearchText] = useState('');
  const [categoryName, setCategoryName] = useState<string>('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>('popular');

  // Data States
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filterCriterias, setFilterCriterias] = useState<FilterCriteria[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});

  // --- Logic Handlers ---
  const loadInitialData = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const [brandsRes, filterCriteriaRes] = await Promise.all([
        categoryBrandService.getBrandsByCategorySlug(slug),
        filterCriteriaService.getFilterCriteriaByCategorySlug(slug),
      ]);
      setBrands(brandsRes.data || []);
      setFilterCriterias(filterCriteriaRes.data || []);
    } catch (error) {
      console.error('Init Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = useCallback(async () => {
    if (!slug) return;
    
    try {
      setProductsLoading(true);
      const searchParams: Record<string, string> = {};
      
      // Map Filters
      if (filters.brands?.length) {
        const brandSlugs = brands
          .filter((b) => filters.brands?.includes(b.id))
          .map((b) => b.slug);
        if (brandSlugs.length) searchParams.brands = brandSlugs.join(',');
      }
      if (filters.inStock) searchParams.inStock = 'true';
      if (filters.priceMin) searchParams.priceMin = filters.priceMin.toString();
      if (filters.priceMax) searchParams.priceMax = filters.priceMax.toString();
      
      // Map Filter Values
      if (filters.filterValues && filters.filterValues.length > 0) {
        searchParams.filterValues = filters.filterValues.join(',');
      }

      // Add sort param to API call (always send sortBy)
      searchParams.sortBy = sortBy;

      const response = await productService.searchProducts(slug, 1, 20, searchParams);
      setProducts(response.data?.data || []);
    } catch (error) {
      console.error('Search Error:', error);
    } finally {
      setProductsLoading(false);
    }
  }, [slug, filters, brands, sortBy]);

  // --- Effects ---
  useEffect(() => {
    if (slug) {
      const name = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setCategoryName(name);
      loadInitialData();
    }
  }, [slug]);

  useEffect(() => {
    if (slug) loadProducts();
  }, [slug, loadProducts]);

  // Filter Handlers
  const handleBrandToggle = useCallback((brandId: number) => {
    setFilters((prev) => {
      const list = prev.brands || [];
      const newList = list.includes(brandId)
        ? list.filter((x) => x !== brandId)
        : [...list, brandId];
      return { ...prev, brands: newList.length > 0 ? newList : undefined };
    });
  }, []);

  const countActiveFilters = useMemo(() => {
    let count = 0;
    if (filters.brands && filters.brands.length > 0) count++;
    if (filters.inStock) count++;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.filterValues && filters.filterValues.length > 0) count++;
    return count;
  }, [filters]);

  const handleFilterApply = useCallback(() => {
    setShowFilterModal(false);
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilters({});
  }, []);

  const handleProductPress = useCallback(
    (productSlug: string) => {
      router.push(`/product-detail?slug=${productSlug}`);
    },
    [router]
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#EF4444" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* --- Top Header --- */}
      <SearchHeader
        searchText={searchText}
        placeholder={categoryName || 'Tìm kiếm...'}
        onSearchChange={setSearchText}
        onBack={() => router.back()}
      />

      {/* --- Sort Bar --- */}
      <SortBar
        sortBy={sortBy}
        onSortChange={setSortBy}
        onFilterPress={() => setShowFilterModal(true)}
        activeFilterCount={countActiveFilters}
      />

      {/* --- Main Content --- */}
      <Box className="flex-1">
        <BrandSelection
          brands={brands}
          selectedBrandIds={filters.brands || []}
          onBrandToggle={handleBrandToggle}
        />
        <ProductGrid
          products={products}
          loading={productsLoading}
          onProductPress={handleProductPress}
          onRefresh={loadProducts}
          refreshing={productsLoading}
        />
      </Box>

      {/* --- Filter Modal --- */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        filterCriterias={filterCriterias}
        onFilterChange={setFilters}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
        activeFilterCount={countActiveFilters}
      />
    </SafeAreaView>
  );
}