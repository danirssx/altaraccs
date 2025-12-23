import Image from 'next/image';
import { CartItem as CartItemType } from '@/store/cartStore';
import { formatPrice } from '@/utils/formatters';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/currency';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { currency, exchangeRate } = useCurrency();
  const handleIncrement = () => {
    onUpdateQuantity(item.productId, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.productId, item.quantity - 1);
    }
  };

  const itemTotal = item.price * item.quantity;

  return (
    <div className="flex gap-4 py-4 border-b" style={{ borderColor: '#d6e2e2' }}>
      {/* Product Image */}
      <div className="relative w-20 h-20 flex-shrink-0 bg-white">
        <Image
          src={item.imageUrl}
          alt={item.productName}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-light mb-1" style={{ color: '#172e3c' }}>
            {item.productName}
          </h3>
          <p className="text-xs font-light" style={{ color: '#172e3c', opacity: 0.6 }}>
            Código: {item.productCode}
          </p>
          {item.size && (
            <p className="text-xs font-light" style={{ color: '#172e3c', opacity: 0.6 }}>
              Tamaño: {item.size}
            </p>
          )}
          {item.color && (
            <p className="text-xs font-light" style={{ color: '#172e3c', opacity: 0.6 }}>
              Color: {item.color}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 border" style={{ borderColor: '#d6e2e2' }}>
            <button
              onClick={handleDecrement}
              className="px-2 py-1 hover:bg-gray-100 transition-colors"
              style={{ color: '#172e3c' }}
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span className="text-sm font-light px-2" style={{ color: '#172e3c' }}>
              {item.quantity}
            </span>
            <button
              onClick={handleIncrement}
              className="px-2 py-1 hover:bg-gray-100 transition-colors"
              style={{ color: '#172e3c' }}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-sm font-medium" style={{ color: '#dbb58e' }}>
              {formatCurrency(itemTotal, currency, exchangeRate)}
            </p>
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.productId)}
        className="self-start hover:opacity-70 transition-opacity"
        style={{ color: '#172e3c' }}
        aria-label="Eliminar artículo"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
