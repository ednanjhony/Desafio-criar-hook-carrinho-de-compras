import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
     const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
   	 return JSON.parse(storagedCart);
   	}

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data } = await api.get(`stock/${productId}`);
			const stock: Stock = data;
			const hasProduct = cart.find(product => product.id === productId);

			if (!hasProduct && stock.amount > 0) {
				const response = await api.get<Product>(
					`products/${productId}`
				);

				setCart([...cart, { ...response.data, amount: 1 }]);

				localStorage.setItem(
					"@RocketseatShoes:cart",
					JSON.stringify([...cart, { ...response, amount: 1 }])
				);
			} else {
				toast.error("Não há quantidade solicitada.")
			}
    } catch {
      toast.error("Erro ao adicionar o produto.")
    }

		
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
