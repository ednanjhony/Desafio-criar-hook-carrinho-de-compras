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
					"@RocketShoes:cart",
					JSON.stringify([...cart, { ...response.data, amount: 1 }])
				);
			} else if (hasProduct && hasProduct.amount <= stock.amount) {
				const amount = hasProduct.amount + 1;
				updateProductAmount({
					productId: productId,
					amount
				});
			} else {
				toast.error('Quantidade solicitada fora de estoque');
			}
    } catch {
      toast.error('Erro na adição do produto');
    }

		
  };

  const removeProduct = (productId: number) => {
    try {
      const hasProduct = cart.find(product => product.id === productId);

			if (hasProduct) {
				const getOthersProducts = cart.filter(product => product.id !== productId);

				setCart(getOthersProducts);

				localStorage.setItem('@RocketShoes:cart', JSON.stringify(getOthersProducts))
			} else {
				throw new Error();
			}

    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const { data } = await api.get(`stock/${productId}`);
			const stock: Stock = data;

			if (amount < 1) {
				throw new Error();
			} else if (amount <= stock.amount) {
				const updateCartList = cart.map((product) => 
					product.id === productId ? { ...product, amount } : product
				);

				setCart(updateCartList);

				localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCartList));
			}else {
				toast.error('Quantidade solicitada fora de estoque');
			}
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
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
