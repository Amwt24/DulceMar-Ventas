import React from 'react';
import { Product } from '../../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onEdit?: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick, onEdit }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick(product)}
          onEdit={() => onEdit?.(product)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
