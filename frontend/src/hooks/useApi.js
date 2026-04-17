import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI, orderAPI, vendorAPI, chatAPI, authAPI } from '../services/api-client';

/**
 * Hook for fetching products
 */
export const useProducts = (params) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productAPI.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for fetching single product
 */
export const useProduct = (productId) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => productAPI.getById(productId),
    enabled: !!productId,
  });
};

/**
 * Hook for creating product
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => productAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

/**
 * Hook for updating product
 */
export const useUpdateProduct = (productId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => productAPI.update(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

/**
 * Hook for fetching orders
 */
export const useOrders = (params) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderAPI.getAll(params),
  });
};

/**
 * Hook for fetching single order
 */
export const useOrder = (orderId) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderAPI.getById(orderId),
    enabled: !!orderId,
  });
};

/**
 * Hook for creating order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => orderAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

/**
 * Hook for confirming payment
 */
export const useConfirmPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentIntentId) => orderAPI.confirmPayment(paymentIntentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

/**
 * Hook for vendors
 */
export const useVendor = (vendorId) => {
  return useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => vendorAPI.getById(vendorId),
    enabled: !!vendorId,
  });
};

/**
 * Hook for vendor products
 */
export const useVendorProducts = (vendorId, params) => {
  return useQuery({
    queryKey: ['vendorProducts', vendorId, params],
    queryFn: () => vendorAPI.getProducts(vendorId, params),
    enabled: !!vendorId,
  });
};

/**
 * Hook for chat conversations
 */
export const useConversations = (params) => {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => chatAPI.getConversations(params),
    refetchInterval: 5000,
  });
};

/**
 * Hook for chat messages
 */
export const useMessages = (conversationId, params) => {
  return useQuery({
    queryKey: ['messages', conversationId, params],
    queryFn: () => chatAPI.getMessages(conversationId, params),
    enabled: !!conversationId,
    refetchInterval: 1000,
  });
};
