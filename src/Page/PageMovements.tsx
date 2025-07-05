import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Chip from '@mui/joy/Chip';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import Alert from '@mui/joy/Alert';
import Snackbar from '@mui/joy/Snackbar';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

// Local imports
import { useResponsive, useResponsiveSpacing } from '../hooks/useResponsive';
import ResponsiveContainer from '../components/ResponsiveContainer';
import ResponsiveModal from '../components/ResponsiveModal';
import PageLayout from '../layouts/PageLayout';
import fonts from '../theme/fonts';
import type { Database, StockMovementWithProduct } from '../general/supabase.types';

type Product = Database['public']['Tables']['Products']['Row'];

// Typography styles for consistency
const typographyStyles = { fontSize: fonts.sizes.small };

const PageMovements = () => {
    const { isMobile } = useResponsive();
    const spacing = useResponsiveSpacing();
    
    // Data states
    const [data, setData] = useState<StockMovementWithProduct[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    
    // UI states
    const [search, setSearch] = useState('');
    const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    
    // Filter states
    const [filterMovementType, setFilterMovementType] = useState<string>('');
    const [filterProductId, setFilterProductId] = useState<string>('');
    const [filterReasonCategory, setFilterReasonCategory] = useState<string>('');
    
    // Adjustment form states
    const [selectedProductId, setSelectedProductId] = useState('');
    const [currentStock, setCurrentStock] = useState<number | null>(null);
    const [loadingStock, setLoadingStock] = useState(false);
    const [actualStockLevel, setActualStockLevel] = useState<string>('');
    const [adjustmentReason, setAdjustmentReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Toast states
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning' | 'neutral'>('success');

    // Helper function to show toast messages
    const showToast = (message: string, color: 'success' | 'danger' | 'warning' | 'neutral' = 'success') => {
        setToastMessage(message);
        setToastColor(color);
        setToastOpen(true);
    };

    // Fetch data for stock movements with product information
    const fetchData = async () => {
        try {
            const { data: movements, error } = await supabase
                .from('stock_movements')
                .select(`
                    *,
                    Products (
                        ProductName,
                        ProductID
                    )
                `)
                .order('date', { ascending: false });

            if (error) {
                console.error('Error fetching movements:', error);
                setData([]);
                showToast('Failed to load movements', 'danger');
            } else {
                setData(movements || []);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setData([]);
            showToast('An unexpected error occurred', 'danger');
        }
    };

    // Fetch all products for the dropdown
    const fetchProducts = async () => {
        try {
            const { data: products, error } = await supabase
                .from('Products')
                .select('*')
                .order('ProductName');

            if (error) {
                console.error('Error fetching products:', error);
                setProducts([]);
            } else {
                setProducts(products || []);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setProducts([]);
        }
    };

    // Calculate current stock level for a specific product
    const fetchCurrentStock = async (productId: string) => {
        if (!productId) {
            setCurrentStock(null);
            return;
        }

        setLoadingStock(true);
        try {
            const { data, error } = await supabase
                .from('stock_movements')
                .select('movement_type, quantity')
                .eq('product_id', productId);

            if (error) {
                console.error('Error fetching stock movements:', error);
                setCurrentStock(null);
            } else {
                const totalStock = (data || []).reduce((total, movement) => {
                    switch (movement.movement_type) {
                        case 'incoming':
                            return total + movement.quantity;
                        case 'outgoing':
                            return total - movement.quantity;
                        case 'adjustment':
                            return total + movement.quantity;
                        default:
                            return total;
                    }
                }, 0);
                setCurrentStock(totalStock);
            }
        } catch (err) {
            console.error('Error calculating stock:', err);
            setCurrentStock(null);
        } finally {
            setLoadingStock(false);
        }
    };

    // Effect to fetch current stock when product is selected
    useEffect(() => {
        if (selectedProductId) {
            fetchCurrentStock(selectedProductId);
        } else {
            setCurrentStock(null);
        }
    }, [selectedProductId]);

    const handleCreateAdjustment = async () => {
        if (!selectedProductId || actualStockLevel === '' || currentStock === null) {
            showToast('Please select a product and enter a valid stock level', 'warning');
            return;
        }

        const newStockLevel = Number(actualStockLevel);
        const adjustmentQuantity = newStockLevel - currentStock;

        if (adjustmentQuantity === 0) {
            showToast('No adjustment needed - the stock level is already at the specified amount', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('stock_movements')
                .insert({
                    product_id: selectedProductId,
                    movement_type: 'adjustment',
                    quantity: adjustmentQuantity,
                    reason: `Manual adjustment: ${adjustmentReason || 'Stock level correction'}`,
                    date: new Date().toISOString()
                });

            if (error) {
                console.error('Error creating adjustment:', error);
                showToast('Failed to create adjustment: ' + error.message, 'danger');
            } else {
                // Reset form
                setSelectedProductId('');
                setActualStockLevel('');
                setAdjustmentReason('');
                setCurrentStock(null);
                setAdjustmentDialogOpen(false);
                
                // Refresh data
                fetchData();
                
                showToast('Stock adjustment created successfully!', 'success');
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            showToast('An unexpected error occurred', 'danger');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchProducts();
    }, []);

    // Filter data based on search and filters
    const filteredData = data.filter((row) => {
        const searchText = search.toLowerCase();
        
        // Text search filter
        const matchesSearch = search === '' || (
            row.id.toLowerCase().includes(searchText) ||
            row.product_id.toLowerCase().includes(searchText) ||
            row.movement_type.toLowerCase().includes(searchText) ||
            (row.reason?.toLowerCase().includes(searchText) ?? false) ||
            (row.Products?.ProductName?.toLowerCase().includes(searchText) ?? false)
        );
        
        // Movement type filter
        const matchesMovementType = filterMovementType === '' || row.movement_type === filterMovementType;
        
        // Product filter
        const matchesProduct = filterProductId === '' || row.product_id === filterProductId;
        
        // Reason category filter
        const matchesReasonCategory = filterReasonCategory === '' || (() => {
            const reason = row.reason?.toLowerCase() || '';
            switch (filterReasonCategory) {
                case 'manual':
                    return reason.includes('manual') || reason.includes('adjustment') || reason.includes('correction');
                case 'damage':
                    return reason.includes('damage') || reason.includes('broken') || reason.includes('defect');
                case 'loss':
                    return reason.includes('loss') || reason.includes('lost') || reason.includes('missing');
                case 'found':
                    return reason.includes('found') || reason.includes('surplus') || reason.includes('extra');
                case 'po':
                    return reason.includes('po') || reason.includes('purchase') || reason.includes('receipt');
                default:
                    return true;
            }
        })();
        
        return matchesSearch && matchesMovementType && matchesProduct && matchesReasonCategory;
    });

    // Helper functions for movement display
    const getMovementColor = (movement: StockMovementWithProduct): 'success' | 'danger' | 'warning' | 'neutral' => {
        switch (movement.movement_type) {
            case 'incoming':
                return 'success';
            case 'outgoing':
                return 'danger';
            case 'adjustment':
                return movement.quantity >= 0 ? 'success' : 'danger';
            default:
                return 'neutral';
        }
    };

    const getMovementIcon = (movement: StockMovementWithProduct) => {
        switch (movement.movement_type) {
            case 'incoming':
                return '↑';
            case 'outgoing':
                return '↓';
            case 'adjustment':
                return '⚖';
            default:
                return '•';
        }
    };

    const getQuantityDisplay = (movement: StockMovementWithProduct) => {
        switch (movement.movement_type) {
            case 'incoming':
                return `+${movement.quantity}`;
            case 'outgoing':
                return `-${movement.quantity}`;
            case 'adjustment':
                return movement.quantity >= 0 ? `+${movement.quantity}` : `${movement.quantity}`;
            default:
                return movement.quantity;
        }
    };

    // Helper function to clear all filters
    const clearAllFilters = () => {
        setFilterMovementType('');
        setFilterProductId('');
        setFilterReasonCategory('');
    };

    // Check if any filters are active
    const hasActiveFilters = filterMovementType !== '' || filterProductId !== '' || filterReasonCategory !== '';

    // Mobile view component
    const MobileView = () => (
        <Box sx={{ width: '100%', minHeight: '100vh' }}>
            {/* Header */}
            <ResponsiveContainer padding="medium">
                <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>
                    Stock Movements
                </Typography>
                
                {/* Search and Filter */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Input
                        placeholder="Search movements..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        startDecorator={<SearchIcon />}
                        sx={{ flex: 1 }}
                    />
                    <IconButton
                        variant={hasActiveFilters ? "solid" : "soft"}
                        color={hasActiveFilters ? "primary" : "neutral"}
                        size="sm"
                        onClick={() => setFilterDialogOpen(true)}
                    >
                        <FilterListIcon />
                    </IconButton>
                </Box>
                
                {/* Active filters indicator */}
                {hasActiveFilters && (
                    <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {filterMovementType && (
                            <Chip size="sm" variant="soft" color="primary">
                                Type: {filterMovementType}
                            </Chip>
                        )}
                        {filterProductId && (
                            <Chip size="sm" variant="soft" color="primary">
                                Product: {products.find(p => p.uuid === filterProductId)?.ProductName || 'Selected'}
                            </Chip>
                        )}
                        {filterReasonCategory && (
                            <Chip size="sm" variant="soft" color="primary">
                                Reason: {filterReasonCategory}
                            </Chip>
                        )}
                    </Box>
                )}
            </ResponsiveContainer>

            {/* Movement List */}
            <Box>
                {filteredData.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography color="neutral">
                            No stock movements found
                        </Typography>
                    </Box>
                ) : (
                    filteredData.map((movement) => (
                        <Box 
                            key={movement.id} 
                            sx={{ 
                                p: 2, 
                                borderBottom: '1px solid', 
                                borderColor: 'divider',
                                '&:hover': {
                                    bgcolor: 'background.level1'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {/* Icon Circle */}
                                <Box 
                                    sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        borderRadius: '50%', 
                                        bgcolor: `${getMovementColor(movement)}.100`,
                                        color: `${getMovementColor(movement)}.600`,
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        flexShrink: 0
                                    }}
                                >
                                    {getMovementIcon(movement)}
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
                                            {movement.Products?.ProductName || 'Unknown Product'}
                                        </Typography>
                                        
                                        {/* Quantity Chip */}
                                        <Chip 
                                            size="sm"
                                            color={getMovementColor(movement)}
                                            variant="soft"
                                            sx={{ fontWeight: 'bold', minWidth: 'fit-content' }}
                                        >
                                            {getQuantityDisplay(movement)}
                                        </Chip>
                                    </Box>
                                    
                                    <Typography level="body-xs" color="neutral" sx={{ mb: 0.5 }}>
                                        ID: {movement.Products?.ProductID || 'N/A'} • {new Date(movement.date).toLocaleDateString()}
                                    </Typography>
                                    
                                    {movement.reason && (
                                        <Typography 
                                            level="body-xs" 
                                            color="neutral" 
                                            sx={{ 
                                                fontStyle: 'italic',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {movement.reason}
                                        </Typography>
                                    )}
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
                onClick={() => setAdjustmentDialogOpen(true)}
            >
                <AddIcon fontSize="small" />
            </IconButton>
        </Box>
    );

    // Desktop view component
    const DesktopView = () => (
        <ResponsiveContainer variant="page" padding="large">
            <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>
                Stock Movements
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Input
                    placeholder="Search movements..."
                    sx={{ flex: 1, fontSize: fonts.sizes.small }}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    startDecorator={<SearchIcon />}
                />
                <Button
                    variant="solid"
                    startDecorator={<AddIcon />}
                    onClick={() => setAdjustmentDialogOpen(true)}
                    sx={{ fontSize: fonts.sizes.small }}
                >
                    Adjust
                </Button>
            </Box>
            
            <Card>
                <Table aria-label="Stock Movements" sx={{ tableLayout: 'auto' }}>
                    <thead>
                        <tr>
                            <th style={typographyStyles}>ID</th>
                            <th style={typographyStyles}>Product</th>
                            <th style={typographyStyles}>Movement Type</th>
                            <th style={typographyStyles}>Quantity</th>
                            <th style={typographyStyles}>Reason</th>
                            <th style={typographyStyles}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', color: '#888', ...typographyStyles }}>
                                    No stock movements found.
                                </td>
                            </tr>
                        )}
                        {filteredData.map((row) => (
                            <tr key={row.id} style={{ cursor: 'pointer' }}>
                                <td style={typographyStyles}>{row.id.substring(0, 8)}...</td>
                                <td style={typographyStyles}>
                                    {row.Products ? (
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{row.Products.ProductName}</div>
                                            <div style={{ fontSize: '0.8em', color: '#666' }}>ID: {row.Products.ProductID}</div>
                                        </div>
                                    ) : (
                                        <span style={{ color: '#999', fontStyle: 'italic' }}>Unknown Product</span>
                                    )}
                                </td>
                                <td style={typographyStyles}>
                                    <Chip 
                                        size="sm" 
                                        variant="soft" 
                                        color={getMovementColor(row)}
                                    >
                                        {row.movement_type === 'incoming' ? '↑ Incoming' :
                                         row.movement_type === 'outgoing' ? '↓ Outgoing' :
                                         '⚖ Adjustment'}
                                    </Chip>
                                </td>
                                <td style={typographyStyles}>
                                    <span style={{ 
                                        fontWeight: 'bold',
                                        color: getMovementColor(row) === 'success' ? '#059669' : 
                                               getMovementColor(row) === 'danger' ? '#dc2626' : '#666'
                                    }}>
                                        {getQuantityDisplay(row)}
                                    </span>
                                </td>
                                <td style={typographyStyles}>{row.reason || 'N/A'}</td>
                                <td style={typographyStyles}>{new Date(row.date).toLocaleString()}</td>
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
            
            {/* Adjustment Dialog */}
            <ResponsiveModal
                open={adjustmentDialogOpen}
                onClose={() => setAdjustmentDialogOpen(false)}
                title="Manual Stock Adjustment"
                size="medium"
                actions={
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                            variant="plain" 
                            onClick={() => setAdjustmentDialogOpen(false)}
                            sx={typographyStyles}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="solid"
                            onClick={handleCreateAdjustment}
                            loading={isLoading}
                            disabled={
                                !selectedProductId || 
                                actualStockLevel === '' || 
                                currentStock === null ||
                                Number(actualStockLevel) === currentStock
                            }
                            sx={typographyStyles}
                        >
                            Create Adjustment
                        </Button>
                    </Box>
                }
            >
                <Stack spacing={2}>
                    <FormControl>
                        <FormLabel>Product</FormLabel>
                        <Select
                            placeholder="Select a product..."
                            value={selectedProductId}
                            onChange={(_, value) => setSelectedProductId(value || '')}
                        >
                            {products.map((product) => (
                                <Option key={product.uuid} value={product.uuid}>
                                    {product.ProductName} (ID: {product.ProductID})
                                </Option>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedProductId && (
                        <FormControl>
                            <FormLabel>Current Stock Level</FormLabel>
                            <Input
                                value={loadingStock ? "Loading..." : currentStock !== null ? currentStock : "N/A"}
                                readOnly
                                sx={{ 
                                    bgcolor: 'neutral.100',
                                    color: currentStock !== null && currentStock <= 0 ? 'danger.500' : 'neutral.600'
                                }}
                            />
                            {currentStock !== null && currentStock <= 0 && (
                                <Typography level="body-sm" sx={{ color: 'danger.500', mt: 0.5 }}>
                                    ⚠️ Warning: Product is at or below zero stock level
                                </Typography>
                            )}
                        </FormControl>
                    )}

                    {currentStock !== null && (
                        <FormControl>
                            <FormLabel>Actual Stock Level</FormLabel>
                            <Input
                                type="number"
                                placeholder="Enter the actual stock level..."
                                value={actualStockLevel}
                                onChange={(e) => setActualStockLevel(e.target.value)}
                                sx={{ ...typographyStyles }}
                                slotProps={{
                                    input: {
                                        min: 0,
                                        max: 999999
                                    }
                                }}
                            />
                            {actualStockLevel !== '' && currentStock !== null && (
                                <Typography 
                                    level="body-sm" 
                                    sx={{ 
                                        mt: 0.5,
                                        color: Number(actualStockLevel) > currentStock ? 'success.600' : 
                                               Number(actualStockLevel) < currentStock ? 'danger.600' : 'neutral.600'
                                    }}
                                >
                                    {Number(actualStockLevel) > currentStock ? 
                                        `+${Number(actualStockLevel) - currentStock} (increase)` :
                                     Number(actualStockLevel) < currentStock ? 
                                        `${Number(actualStockLevel) - currentStock} (decrease)` :
                                        'No change needed'
                                    }
                                </Typography>
                            )}
                        </FormControl>
                    )}

                    <FormControl>
                        <FormLabel>Reason for Adjustment</FormLabel>
                        <Input
                            placeholder="e.g., damage, loss, found inventory, physical count correction..."
                            value={adjustmentReason}
                            onChange={(e) => setAdjustmentReason(e.target.value)}
                            sx={{ ...typographyStyles }}
                        />
                    </FormControl>
                </Stack>
            </ResponsiveModal>

            {/* Filter Dialog (Mobile) */}
            {isMobile && (
                <ResponsiveModal
                    open={filterDialogOpen}
                    onClose={() => setFilterDialogOpen(false)}
                    title="Filter Movements"
                    size="medium"
                    actions={
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', width: '100%' }}>
                            <Button 
                                variant="plain"
                                color="neutral"
                                onClick={clearAllFilters}
                                disabled={!hasActiveFilters}
                            >
                                Clear All
                            </Button>
                            <Button 
                                onClick={() => setFilterDialogOpen(false)}
                            >
                                Apply Filters
                            </Button>
                        </Box>
                    }
                >
                    <Stack spacing={2}>
                        <FormControl>
                            <FormLabel>Movement Type</FormLabel>
                            <Select
                                placeholder="All types"
                                value={filterMovementType}
                                onChange={(_, value) => setFilterMovementType(value || '')}
                            >
                                <Option value="">All Types</Option>
                                <Option value="incoming">Incoming</Option>
                                <Option value="outgoing">Outgoing</Option>
                                <Option value="adjustment">Adjustment</Option>
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Product</FormLabel>
                            <Select
                                placeholder="All products"
                                value={filterProductId}
                                onChange={(_, value) => setFilterProductId(value || '')}
                            >
                                <Option value="">All Products</Option>
                                {products.map((product) => (
                                    <Option key={product.uuid} value={product.uuid}>
                                        {product.ProductName}
                                    </Option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Reason Category</FormLabel>
                            <Select
                                placeholder="All reasons"
                                value={filterReasonCategory}
                                onChange={(_, value) => setFilterReasonCategory(value || '')}
                            >
                                <Option value="">All Reasons</Option>
                                <Option value="manual">Manual Adjustment</Option>
                                <Option value="damage">Damage/Defect</Option>
                                <Option value="loss">Loss/Missing</Option>
                                <Option value="found">Found/Surplus</Option>
                                <Option value="po">Purchase Order</Option>
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

export default PageMovements;
