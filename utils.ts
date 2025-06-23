import { OrderStatus } from './components/Page/PageOrderDesktop';

export function openSidebar() {
  if (typeof window !== 'undefined') {
    console.log('Opening sidebar...'); // Debug log
    document.body.style.overflow = 'hidden';
    document.documentElement.style.setProperty('--SideNavigation-slideIn', '1');
  }
}

export function closeSidebar() {
  if (typeof window !== 'undefined') {
    console.log('Closing sidebar...'); // Debug log
    const currentSlideIn = document.documentElement.style.getPropertyValue('--SideNavigation-slideIn');
    console.log('Current --SideNavigation-slideIn value:', currentSlideIn);
    document.documentElement.style.removeProperty('--SideNavigation-slideIn');
    document.body.style.removeProperty('overflow');
  }
}

export function toggleSidebar() {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const slideIn = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--SideNavigation-slideIn');
    if (slideIn) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }
}

export function handleOrderClick(
  orderId: string,
  rows: Array<{ order_number_display?: string; uuid: string; date: string; status: OrderStatus; customer: any }>,
  setSelectedOrder: (order: { order_number_display?: string; uuid: string; date: string; status: OrderStatus; customer: any } | null) => void,
  setOrderDetailsOpen: (open: boolean) => void
) {
  const found = rows.find(row => (row.order_number_display || row.uuid) === orderId);
  if (found) {
    setSelectedOrder(found);
    setOrderDetailsOpen(true);
  } else {
    console.error('Order not found for orderId:', orderId);
  }
}
