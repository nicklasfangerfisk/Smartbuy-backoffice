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
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import Textarea from '@mui/joy/Textarea';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';
import Alert from '@mui/joy/Alert';
import Snackbar from '@mui/joy/Snackbar';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { StockMovementWithProduct } from '../general/supabase.types';

// Edge-to-edge mobile layout styles
const globalStylesId = 'movements-mobile-styles';
if (!document.getElementById(globalStylesId)) {
    const style = document.createElement('style');
    style.id = globalStylesId;
    style.textContent = `
        .movements-mobile-container {
            box-sizing: border-box;
            width: 100vw;
            margin-left: calc(-50vw + 50%);
            margin-right: calc(-50vw + 50%);
        }
    `;
    document.head.appendChild(style);
}

type Product = {
    uuid: string;
    ProductName: string | null;
    ProductID: number | null;
};

const PageMovementsMobile = () => {
    const [data, setData] = useState<StockMovementWithProduct[]>([]);
    const [search, setSearch] = useState('');
    const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [currentStock, setCurrentStock] = useState<number | null>(null);
    const [loadingStock, setLoadingStock] = useState(false);
    const [actualStockLevel, setActualStockLevel] = useState<string>('');
    const [adjustmentReason, setAdjustmentReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning' | 'neutral'>('success');
    
    // Filter states
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [filterMovementType, setFilterMovementType] = useState<string>('');
    const [filterProductId, setFilterProductId] = useState<string>('');
    const [filterReasonCategory, setFilterReasonCategory] = useState<string>('');

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
            } else {
                setData(movements || []);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setData([]);
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
                // SIMPLIFIED CALCULATION - quantities are now signed for adjustments!
                const totalStock = (data || []).reduce((total, movement) => {
                    switch (movement.movement_type) {
                        case 'incoming':
                            return total + movement.quantity;
                        case 'outgoing':
                            return total - movement.quantity;
                        case 'adjustment':
                            return total + movement.quantity; // Quantity is already signed (+/-)
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

        // If no change, don't proceed
        if (adjustmentQuantity === 0) {
            showToast('No adjustment needed - the stock level is already at the specified amount', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            // SIMPLIFIED: Store signed quantity directly (positive or negative)
            // Database will prevent negative stock with triggers
            
            const { error } = await supabase
                .from('stock_movements')
                .insert({
                    product_id: selectedProductId,
                    movement_type: 'adjustment',
                    quantity: adjustmentQuantity, // Can be positive or negative!
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
        
        // Reason category filter (simplified categorization)
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

    // Helper function to clear all filters
    const clearAllFilters = () => {
        setFilterMovementType('');
        setFilterProductId('');
        setFilterReasonCategory('');
    };

    // Check if any filters are active
    const hasActiveFilters = filterMovementType !== '' || filterProductId !== '' || filterReasonCategory !== '';

    const getMovementColor = (movement: StockMovementWithProduct) => {
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
                return '';
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

    return (
        <Box
            className="movements-mobile-container"
            sx={{
                width: '100vw',
                minHeight: '100vh',
                bgcolor: 'background.body',
                pb: '100px', // Padding to ensure content doesn't get covered by fixed mobile menu
                boxSizing: 'border-box'
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: 'background.surface', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography level="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Stock Movements
                </Typography>
                
                {/* Search and Filter Row */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Input
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        startDecorator={<SearchIcon />}
                        size="sm"
                        sx={{ 
                            flex: 1,
                            bgcolor: 'background.level1',
                            border: '1px solid',
                            borderColor: 'neutral.300'
                        }}
                    />
                    
                    <IconButton
                        variant={hasActiveFilters ? "solid" : "soft"}
                        color={hasActiveFilters ? "primary" : "neutral"}
                        size="sm"
                        onClick={() => setFilterDialogOpen(true)}
                        sx={{
                            flexShrink: 0,
                            '&:hover': {
                                bgcolor: hasActiveFilters ? 'primary.600' : 'neutral.200'
                            }
                        }}
                    >
                        <FilterListIcon fontSize="small" />
                    </IconButton>
                </Box>
                
                {/* Active filters indicator */}
                {hasActiveFilters && (
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
            </Box>

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

            {/* Subtle Add Movement Button */}
            <IconButton
                color="primary"
                variant="soft"
                size="sm"
                sx={{
                    position: 'fixed',
                    bottom: 80, // Position above mobile menu
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

            {/* Filter Dialog */}
            <Modal 
                open={filterDialogOpen} 
                onClose={() => setFilterDialogOpen(false)}
            >
                <ModalDialog
                    size="lg"
                    sx={{ 
                        m: 1,
                        maxHeight: '90vh',
                        width: '100%',
                        maxWidth: 500
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography level="h4">Filters</Typography>
                        <ModalClose />
                    </Box>
                    
                    <Stack spacing={3}>
                        {/* Movement Type Filter */}
                        <FormControl>
                            <FormLabel>Movement Type</FormLabel>
                            <Select
                                value={filterMovementType}
                                onChange={(e, value) => setFilterMovementType(value || '')}
                                placeholder="Filter by movement type"
                            >
                                <Option value="">All Types</Option>
                                <Option value="incoming">Incoming</Option>
                                <Option value="outgoing">Outgoing</Option>
                                <Option value="adjustment">Adjustment</Option>
                            </Select>
                        </FormControl>

                        {/* Product Filter */}
                        <FormControl>
                            <FormLabel>Product</FormLabel>
                            <Select
                                value={filterProductId}
                                onChange={(e, value) => setFilterProductId(value || '')}
                                placeholder="Filter by product"
                            >
                                <Option value="">All Products</Option>
                                {products.map((product) => (
                                    <Option key={product.uuid} value={product.uuid}>
                                        {product.ProductName} (ID: {product.ProductID})
                                    </Option>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Reason Category Filter */}
                        <FormControl>
                            <FormLabel>Reason Category</FormLabel>
                            <Select
                                value={filterReasonCategory}
                                onChange={(e, value) => setFilterReasonCategory(value || '')}
                                placeholder="Filter by reason category"
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
                    
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', pt: 2 }}>
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
                </ModalDialog>
            </Modal>

            {/* Mobile Adjustment Dialog */}
            <Modal 
                open={adjustmentDialogOpen} 
                onClose={() => setAdjustmentDialogOpen(false)}
            >
                <ModalDialog
                    size="lg"
                    sx={{ 
                        m: 1,
                        maxHeight: '90vh',
                        width: '100%',
                        maxWidth: 500
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography level="h4">Stock Adjustment</Typography>
                        <ModalClose />
                    </Box>
                    
                    <Stack spacing={3}>
                        {/* Product Selection */}
                        <FormControl>
                            <FormLabel>Select Product</FormLabel>
                            <Select
                                value={selectedProductId}
                                onChange={(e, value) => setSelectedProductId(value || '')}
                                placeholder="Choose a product..."
                            >
                                {products.map((product) => (
                                    <Option key={product.uuid} value={product.uuid}>
                                        {product.ProductName} (ID: {product.ProductID})
                                    </Option>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Current Stock Display */}
                        {selectedProductId && (
                            <Box>
                                <Typography level="body-sm" color="neutral" sx={{ mb: 1 }}>
                                    Current Stock Level
                                </Typography>
                                <Card variant="outlined">
                                    <CardContent sx={{ py: 2 }}>
                                        <Typography level="h2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                                            {loadingStock ? (
                                                <CircularProgress size="sm" />
                                            ) : (
                                                currentStock !== null ? currentStock : "N/A"
                                            )}
                                        </Typography>
                                        {currentStock !== null && currentStock <= 0 && (
                                            <Alert color="warning" sx={{ mt: 1 }}>
                                                ⚠️ Product is at or below zero stock level
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>
                            </Box>
                        )}

                        {/* Actual Stock Level Input */}
                        {currentStock !== null && (
                            <Box>
                                <FormControl>
                                    <FormLabel>Set Actual Stock Level</FormLabel>
                                    <Input
                                        type="number"
                                        value={actualStockLevel}
                                        onChange={(e) => setActualStockLevel(e.target.value)}
                                        slotProps={{
                                            input: {
                                                min: 0,
                                                max: 999999
                                            }
                                        }}
                                    />
                                </FormControl>
                                {actualStockLevel !== '' && currentStock !== null && (
                                    <Typography 
                                        level="body-sm" 
                                        sx={{ 
                                            mt: 1,
                                            fontWeight: 'bold'
                                        }}
                                        color={
                                            Number(actualStockLevel) > currentStock ? 'success' : 
                                            Number(actualStockLevel) < currentStock ? 'danger' : 'neutral'
                                        }
                                    >
                                        {Number(actualStockLevel) > currentStock ? 
                                            `+${Number(actualStockLevel) - currentStock} (increase)` :
                                         Number(actualStockLevel) < currentStock ? 
                                            `${Number(actualStockLevel) - currentStock} (decrease)` :
                                            'No change needed'
                                        }
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {/* Reason */}
                        <FormControl>
                            <FormLabel>Reason for Adjustment</FormLabel>
                            <Textarea
                                placeholder="e.g., damage, loss, found inventory..."
                                value={adjustmentReason}
                                onChange={(e) => setAdjustmentReason(e.target.value)}
                                minRows={2}
                            />
                        </FormControl>
                    </Stack>
                    
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 2 }}>
                        <Button 
                            variant="plain"
                            color="neutral"
                            onClick={() => setAdjustmentDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreateAdjustment}
                            disabled={
                                !selectedProductId || 
                                actualStockLevel === '' || 
                                currentStock === null ||
                                Number(actualStockLevel) === currentStock ||
                                isLoading
                            }
                            loading={isLoading}
                            startDecorator={!isLoading && <AddIcon />}
                        >
                            {isLoading ? 'Creating...' : 'Create Adjustment'}
                        </Button>
                    </Box>
                </ModalDialog>
            </Modal>

            {/* Toast Notification */}
            <Snackbar
                open={toastOpen}
                onClose={() => setToastOpen(false)}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ 
                    top: 16,
                    zIndex: 2000 // Above modal
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
        </Box>
    );
};

export default PageMovementsMobile;
