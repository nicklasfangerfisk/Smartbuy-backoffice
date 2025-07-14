/**
 * PageProducts - Product management with inventory tracking
 * 
 * HOCs: ProtectedRoute (route-level auth guard)
 * Layout: PageLayout + ResponsiveContainer(table-page) - 16px padding
 * Responsive: Mobile/Desktop views, useResponsive() hook
 * D    const handleAddDialogSave = async (values: { ProductName: string; SalesPrice: string; CostPrice: string; image_url?: string }) => {
        setSubmitting(true);
        try {
            const productData = prepareProductCurrencyData({
                ProductName: values.ProductName,
                SalesPrice: parseFloat(values.SalesPrice),
                CostPrice: parseFloat(values.CostPrice),
                image_url: values.image_url || null,
                CreatedAt: new Date().toISOString(),
            });roductTableForm for CRUD operations
 * Data: Supabase Products table
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import LinearProgress from '@mui/joy/LinearProgress';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import Avatar from '@mui/joy/Avatar';
import Tooltip from '@mui/joy/Tooltip';
import Alert from '@mui/joy/Alert';
import Snackbar from '@mui/joy/Snackbar';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import InventoryIcon from '@mui/icons-material/Inventory';

// Local imports
import { useResponsive } from '../hooks/useResponsive';
import ResponsiveContainer from '../components/ResponsiveContainer';
import ResponsiveModal from '../components/ResponsiveModal';
import PageLayout from '../layouts/PageLayout';
import DialogProducts from '../Dialog/DialogProducts';
import fonts from '../theme/fonts';
import { formatCurrency } from '../utils/currencyUtils';
import { prepareProductCurrencyData } from '../utils/currencyUtils';

// Typography styles for consistency
const typographyStyles = { fontSize: fonts.sizes.small };

// Types
interface Product {
  uuid: string;
  ProductName: string;
  SalesPrice: number;
  CostPrice: number;
  image_url?: string;
  CreatedAt: string;
  ProductID?: string;
  min_stock?: number;
  max_stock?: number;
  reorder_amount?: number;
}

interface ProductStocks {
  [productId: string]: number;
}

const PageProducts = () => {
    const { isMobile } = useResponsive();
    
    // Data states
    const [products, setProducts] = useState<Product[]>([]);
    const [productStocks, setProductStocks] = useState<ProductStocks>({});
    const [loading, setLoading] = useState(false);
    const [stockLoading, setStockLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // UI states
    const [search, setSearch] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [viewProduct, setViewProduct] = useState<Product | null>(null);
    
    // Toast notification states
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastColor, setToastColor] = useState<'success' | 'warning' | 'danger'>('success');

    // Utility functions
    const showToast = (message: string, color: 'success' | 'warning' | 'danger' = 'success') => {
        setToastMessage(message);
        setToastColor(color);
        setToastOpen(true);
    };

    const getStockStatus = (stock: number) => {
        if (stock <= 0) return { status: 'Out of Stock', color: 'danger' as const };
        if (stock <= 10) return { status: 'Low Stock', color: 'warning' as const };
        return { status: 'In Stock', color: 'success' as const };
    };

    const getStockIcon = (stock: number) => {
        const status = getStockStatus(stock);
        return (
            <Box 
                sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: '50%', 
                    bgcolor: `${status.color}.100`,
                    color: `${status.color}.600`,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}
            >
                <InventoryIcon sx={{ fontSize: '12px' }} />
            </Box>
        );
    };

    // Data fetching
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('Products')
                .select('*')
                .order('CreatedAt', { ascending: false });

            if (error) {
                console.error('Error fetching products:', error);
                showToast('Failed to fetch products', 'danger');
                return;
            }

            if (data) {
                setProducts(data);
                await fetchProductStocks(data);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            showToast('Failed to fetch products', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductStocks = async (products: Product[]) => {
        setStockLoading(true);
        try {
            const { data: stockData, error } = await supabase
                .from('stock_movements')
                .select('product_id, movement_type, quantity');

            if (error) {
                console.error('Error fetching stock data:', error);
                return;
            }

            if (stockData) {
                const stockMap: ProductStocks = {};
                
                products.forEach(product => {
                    const movements = stockData.filter(movement => movement.product_id === product.uuid);
                    const totalStock = movements.reduce((total, movement) => {
                        switch (movement.movement_type) {
                            case 'incoming':
                            case 'adjustment':
                                return total + (movement.quantity || 0);
                            case 'outgoing':
                                return total - (movement.quantity || 0);
                            default:
                                return total;
                        }
                    }, 0);
                    stockMap[product.uuid] = totalStock;
                });

                setProductStocks(stockMap);
            }
        } catch (err) {
            console.error('Error fetching stock levels:', err);
        } finally {
            setStockLoading(false);
        }
    };

    // Effects
    useEffect(() => {
        fetchProducts();
    }, []);

    // Filtering
    const filteredProducts = products.filter(product => {
        const matchesSearch = !search || 
            product.ProductName.toLowerCase().includes(search.toLowerCase()) ||
            product.ProductID?.toLowerCase().includes(search.toLowerCase());

        const stock = productStocks[product.uuid] || 0;
        const matchesStock = !stockFilter || 
            (stockFilter === 'in-stock' && stock > 10) ||
            (stockFilter === 'low-stock' && stock > 0 && stock <= 10) ||
            (stockFilter === 'out-of-stock' && stock <= 0);

        return matchesSearch && matchesStock;
    });

    // Event handlers
    const handleAddProduct = () => {
        setAddDialogOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditProduct(product);
        setEditDialogOpen(true);
    };

    const handleViewProduct = (product: Product) => {
        setViewProduct(product);
        setViewDialogOpen(true);
    };

    const handleEditFromView = () => {
        if (viewProduct) {
            setEditProduct(viewProduct);
            setViewDialogOpen(false);
            setViewProduct(null);
            setEditDialogOpen(true);
        }
    };

    const handleDeleteProduct = async (uuid: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('Products')
                .delete()
                .eq('uuid', uuid);

            if (error) {
                console.error('Error deleting product:', error);
                showToast('Failed to delete product', 'danger');
                return;
            }

            setProducts(products.filter(p => p.uuid !== uuid));
            showToast('Product deleted successfully', 'success');
        } catch (err) {
            console.error('Error deleting product:', err);
            showToast('Failed to delete product', 'danger');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddDialogSave = async (values: { 
        ProductName: string; 
        SalesPrice: string; 
        CostPrice: string; 
        image_url?: string;
        min_stock?: string;
        max_stock?: string;
        reorder_amount?: string;
    }) => {
        setSubmitting(true);
        try {
            const productData = prepareProductCurrencyData({
                ProductName: values.ProductName,
                SalesPrice: parseFloat(values.SalesPrice),
                CostPrice: parseFloat(values.CostPrice),
                image_url: values.image_url || null,
                min_stock: values.min_stock ? parseInt(values.min_stock) : null,
                max_stock: values.max_stock ? parseInt(values.max_stock) : null,
                reorder_amount: values.reorder_amount ? parseInt(values.reorder_amount) : null,
                CreatedAt: new Date().toISOString(),
            });

            const { data, error } = await supabase
                .from('Products')
                .insert([productData])
                .select()
                .single();

            if (error) {
                console.error('Error adding product:', error);
                showToast('Failed to add product', 'danger');
                return;
            }

            showToast('Product added successfully', 'success');
            setAddDialogOpen(false);
            fetchProducts(); // Refresh the list
        } catch (err) {
            console.error('Error adding product:', err);
            showToast('Failed to add product', 'danger');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditDialogSave = async (values: { 
        ProductName: string; 
        SalesPrice: string; 
        CostPrice: string; 
        image_url?: string;
        min_stock?: string;
        max_stock?: string;
        reorder_amount?: string;
    }) => {
        if (!editProduct) return;

        setSubmitting(true);
        try {
            const productData = prepareProductCurrencyData({
                ProductName: values.ProductName,
                SalesPrice: parseFloat(values.SalesPrice),
                CostPrice: parseFloat(values.CostPrice),
                image_url: values.image_url || null,
                min_stock: values.min_stock ? parseInt(values.min_stock) : null,
                max_stock: values.max_stock ? parseInt(values.max_stock) : null,
                reorder_amount: values.reorder_amount ? parseInt(values.reorder_amount) : null,
            });

            const { error } = await supabase
                .from('Products')
                .update(productData)
                .eq('uuid', editProduct.uuid);

            if (error) {
                console.error('Error updating product:', error);
                showToast('Failed to update product', 'danger');
                return;
            }

            showToast('Product updated successfully', 'success');
            setEditDialogOpen(false);
            setEditProduct(null);
            fetchProducts(); // Refresh the list
        } catch (err) {
            console.error('Error updating product:', err);
            showToast('Failed to update product', 'danger');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseFilters = () => {
        setFilterDialogOpen(false);
    };

    const handleClearFilters = () => {
        setStockFilter('');
    };

    // Mobile view component
    const MobileView = () => (
        <Box sx={{ pb: 2 }}>
            {/* Search Bar */}
            <ResponsiveContainer variant="page" padding="medium">
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        startDecorator={<SearchIcon />}
                        sx={{ flex: 1, fontSize: '16px' }}
                    />
                    <IconButton
                        variant="soft"
                        onClick={() => setFilterDialogOpen(true)}
                        sx={{ flexShrink: 0 }}
                    >
                        <FilterListIcon />
                    </IconButton>
                </Box>

                {/* Active Filters */}
                {stockFilter && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip size="sm" variant="soft" color="primary">
                            Stock: {stockFilter.replace('-', ' ')}
                        </Chip>
                    </Box>
                )}

                {/* Loading indicator */}
                {loading && <LinearProgress sx={{ mb: 2 }} />}
            </ResponsiveContainer>

            {/* Products List */}
            <Box>
                {filteredProducts.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography color="neutral">
                            {loading ? 'Loading products...' : 'No products found'}
                        </Typography>
                    </Box>
                ) : (
                    filteredProducts.map((product) => (
                        <Box 
                            key={product.uuid} 
                            sx={{ 
                                p: 2, 
                                borderBottom: '1px solid', 
                                borderColor: 'divider',
                                cursor: 'pointer',
                                '&:hover': {
                                    bgcolor: 'background.level1'
                                }
                            }}
                            onClick={() => handleViewProduct(product)}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {/* Product Image */}
                                <Box sx={{ flexShrink: 0 }}>
                                    {product.image_url ? (
                                        <Avatar 
                                            src={product.image_url} 
                                            sx={{ width: 48, height: 48 }}
                                            alt={product.ProductName}
                                        />
                                    ) : (
                                        <Avatar sx={{ width: 48, height: 48, bgcolor: 'neutral.100' }}>
                                            <ImageIcon />
                                        </Avatar>
                                    )}
                                </Box>

                                {/* Main Content */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography 
                                            level="title-sm" 
                                            sx={{ 
                                                fontWeight: 'bold',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '60%'
                                            }}
                                        >
                                            {product.ProductName}
                                        </Typography>
                                        
                                        {/* Stock Status */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {stockLoading ? (
                                                <Typography level="body-xs" color="neutral">...</Typography>
                                            ) : (
                                                <>
                                                    {getStockIcon(productStocks[product.uuid] || 0)}
                                                    <Chip 
                                                        size="sm"
                                                        color={getStockStatus(productStocks[product.uuid] || 0).color}
                                                        variant="soft"
                                                        sx={{ fontSize: '10px', minWidth: 'fit-content' }}
                                                    >
                                                        {productStocks[product.uuid] || 0}
                                                    </Chip>
                                                </>
                                            )}
                                        </Box>
                                    </Box>
                                    
                                    <Typography level="body-xs" color="neutral" sx={{ mb: 0.5 }}>
                                        ID: {product.ProductID || 'N/A'} • {new Date(product.CreatedAt).toLocaleDateString()}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography 
                                                level="body-xs" 
                                                sx={{ 
                                                    fontWeight: 'bold',
                                                    color: 'success.600'
                                                }}
                                            >
                                                Sale: {formatCurrency(product.SalesPrice)}
                                            </Typography>
                                            <Typography 
                                                level="body-xs" 
                                                color="neutral"
                                            >
                                                Cost: {formatCurrency(product.CostPrice)}
                                            </Typography>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton
                                                size="sm"
                                                variant="soft"
                                                color="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditProduct(product);
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="sm"
                                                variant="soft"
                                                color="danger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteProduct(product.uuid);
                                                }}
                                                disabled={submitting}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    ))
                )}
            </Box>

            {/* Floating Action Button */}
            <IconButton
                color="primary"
                variant="soft"
                size="sm"
                sx={{
                    position: 'fixed',
                    bottom: 80,
                    right: 16,
                    zIndex: 1000,
                    borderRadius: '8px',
                    width: 40,
                    height: 40,
                    boxShadow: 'sm',
                    bgcolor: 'primary.100',
                    '&:hover': {
                        bgcolor: 'primary.200',
                        boxShadow: 'md'
                    }
                }}
                onClick={handleAddProduct}
            >
                <AddIcon fontSize="small" />
            </IconButton>
        </Box>
    );

    // Desktop view component
    const DesktopView = () => (
        <ResponsiveContainer variant="table-page">
            <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>
                Products
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Input
                    placeholder="Search products..."
                    sx={{ flex: 1, fontSize: fonts.sizes.small }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    startDecorator={<SearchIcon />}
                />
                <Select
                    placeholder="Filter by stock"
                    value={stockFilter}
                    onChange={(_, value) => setStockFilter(value || '')}
                    sx={{ minWidth: 160, fontSize: fonts.sizes.small }}
                >
                    <Option value="">All Stock Levels</Option>
                    <Option value="in-stock">In Stock</Option>
                    <Option value="low-stock">Low Stock</Option>
                    <Option value="out-of-stock">Out of Stock</Option>
                </Select>
                <Button
                    variant="solid"
                    startDecorator={<AddIcon />}
                    onClick={handleAddProduct}
                    sx={{ fontSize: fonts.sizes.small }}
                >
                    Add Product
                </Button>
            </Box>
            
            <Card sx={{ overflow: 'visible' }}>
                {loading && <LinearProgress />}
                <Table 
                    aria-label="Products" 
                    sx={{ 
                        tableLayout: 'auto',
                        '& tbody tr': {
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'background.level1'
                            }
                        }
                    }}
                >
                    <thead>
                        <tr>
                            <th style={typographyStyles}>Image</th>
                            <th style={typographyStyles}>Name</th>
                            <th style={typographyStyles}>Stock</th>
                            <th style={typographyStyles}>Sales Price</th>
                            <th style={typographyStyles}>Cost Price</th>
                            <th style={typographyStyles}>Created</th>
                            <th style={typographyStyles}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', color: '#888', ...typographyStyles }}>
                                    {loading ? 'Loading products...' : 'No products found.'}
                                </td>
                            </tr>
                        )}
                        {filteredProducts.map((product) => (
                            <tr 
                                key={product.uuid}
                                onClick={() => handleViewProduct(product)}
                            >
                                <td style={typographyStyles}>
                                    {product.image_url ? (
                                        <Avatar 
                                            src={product.image_url} 
                                            sx={{ width: 32, height: 32 }}
                                            alt={product.ProductName}
                                        />
                                    ) : (
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'neutral.100' }}>
                                            <ImageIcon sx={{ fontSize: '16px' }} />
                                        </Avatar>
                                    )}
                                </td>
                                <td style={typographyStyles}>
                                    <Box>
                                        <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
                                            {product.ProductName}
                                        </Typography>
                                        <Typography level="body-xs" color="neutral">
                                            ID: {product.ProductID || 'N/A'}
                                        </Typography>
                                    </Box>
                                </td>
                                <td style={typographyStyles}>
                                    {stockLoading ? (
                                        <Typography level="body-sm" sx={{ color: 'neutral.500' }}>Loading...</Typography>
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip
                                                size="sm"
                                                variant="soft"
                                                color={getStockStatus(productStocks[product.uuid] || 0).color}
                                            >
                                                {getStockStatus(productStocks[product.uuid] || 0).status}
                                            </Chip>
                                            <Tooltip 
                                                title={`Current stock level: ${productStocks[product.uuid] || 0} units`}
                                                arrow
                                            >
                                                <Typography 
                                                    level="body-sm" 
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        color: getStockStatus(productStocks[product.uuid] || 0).color === 'danger' ? 'danger.500' :
                                                               getStockStatus(productStocks[product.uuid] || 0).color === 'warning' ? 'warning.600' : 
                                                               'success.600'
                                                    }}
                                                >
                                                    {productStocks[product.uuid] || 0}
                                                </Typography>
                                            </Tooltip>
                                            {/* Stock level bar indicator */}
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 4,
                                                    bgcolor: 'neutral.200',
                                                    borderRadius: 2,
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: `${Math.min(100, Math.max(0, ((productStocks[product.uuid] || 0) / 50) * 100))}%`,
                                                        height: '100%',
                                                        bgcolor: getStockStatus(productStocks[product.uuid] || 0).color === 'danger' ? 'danger.400' :
                                                                getStockStatus(productStocks[product.uuid] || 0).color === 'warning' ? 'warning.400' : 
                                                                'success.400',
                                                        borderRadius: 2
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    )}
                                </td>
                                <td style={typographyStyles}>
                                    <Typography level="body-sm" sx={{ fontWeight: 'bold', color: 'success.600' }}>
                                        {formatCurrency(product.SalesPrice)}
                                    </Typography>
                                </td>
                                <td style={typographyStyles}>
                                    <Typography level="body-sm" color="neutral">
                                        {formatCurrency(product.CostPrice)}
                                    </Typography>
                                </td>
                                <td style={typographyStyles}>
                                    {new Date(product.CreatedAt).toLocaleDateString()}
                                </td>
                                <td style={typographyStyles}>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton
                                            size="sm"
                                            variant="soft"
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditProduct(product);
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="sm"
                                            variant="soft"
                                            color="danger"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteProduct(product.uuid);
                                            }}
                                            disabled={submitting}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </ResponsiveContainer>
    );

    return (
        <PageLayout>
            {isMobile ? <MobileView /> : <DesktopView />}
            
            {/* Add Product Dialog */}
            <DialogProducts
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                product={null}
                mode="add"
                onSave={handleAddDialogSave}
            />
            
            {/* Edit Product Dialog */}
            <DialogProducts
                open={editDialogOpen}
                onClose={() => { setEditDialogOpen(false); setEditProduct(null); }}
                product={editProduct}
                mode="edit"
                onSave={handleEditDialogSave}
            />

            {/* View Product Dialog */}
            <DialogProducts
                open={viewDialogOpen}
                onClose={() => { setViewDialogOpen(false); setViewProduct(null); }}
                product={viewProduct}
                mode="view"
                onSave={() => {}} // Not used in view mode
                onEdit={handleEditFromView}
            />
            
            {/* Filter Dialog (Mobile) */}
            {isMobile && (
                <ResponsiveModal
                    open={filterDialogOpen}
                    onClose={handleCloseFilters}
                    title="Filter Products"
                    size="medium"
                    actions={
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                                variant="plain" 
                                onClick={handleClearFilters}
                                sx={typographyStyles}
                            >
                                Clear All
                            </Button>
                            <Button 
                                variant="solid"
                                onClick={handleCloseFilters}
                                sx={typographyStyles}
                            >
                                Apply
                            </Button>
                        </Box>
                    }
                >
                    <Stack spacing={2}>
                        <FormControl>
                            <FormLabel>Stock Level</FormLabel>
                            <Select
                                placeholder="All stock levels"
                                value={stockFilter}
                                onChange={(_, value) => setStockFilter(value || '')}
                            >
                                <Option value="">All Stock Levels</Option>
                                <Option value="in-stock">In Stock</Option>
                                <Option value="low-stock">Low Stock</Option>
                                <Option value="out-of-stock">Out of Stock</Option>
                            </Select>
                        </FormControl>
                    </Stack>
                </ResponsiveModal>
            )}

            {/* Toast Notification */}
            <Snackbar
                open={toastOpen}
                onClose={() => setToastOpen(false)}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ 
                    top: 16,
                    zIndex: 2000
                }}
            >
                <Alert 
                    color={toastColor}
                    variant="solid"
                    sx={{ width: '100%' }}
                >
                    {toastMessage}
                </Alert>
            </Snackbar>
        </PageLayout>
    );
};

export default PageProducts;
