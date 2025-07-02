/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import { ColorPaletteProp } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Card from '@mui/joy/Card';
import Alert from '@mui/joy/Alert';
import Snackbar from '@mui/joy/Snackbar';
import { supabase } from '../utils/supabaseClient';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import fonts from '../../theme/fonts';
import type { Database, StockMovementWithProduct, StockMovementType } from '../general/supabase.types';
import PageLayout from '../layouts/PageLayout';

type Product = Database['public']['Tables']['Products']['Row'];

// Apply font size to Typography components
const typographyStyles = { fontSize: fonts.sizes.small };

const PageMovementsDesktop = () => {
    const [data, setData] = React.useState<StockMovementWithProduct[]>([]);
    const [search, setSearch] = React.useState('');
    const [adjustmentDialogOpen, setAdjustmentDialogOpen] = React.useState(false);
    const [products, setProducts] = React.useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = React.useState('');
    const [currentStock, setCurrentStock] = React.useState<number | null>(null);
    const [loadingStock, setLoadingStock] = React.useState(false);
    const [actualStockLevel, setActualStockLevel] = React.useState<string | number>('');
    const [adjustmentReason, setAdjustmentReason] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [toastOpen, setToastOpen] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState('');
    const [toastColor, setToastColor] = React.useState<'success' | 'danger' | 'warning' | 'neutral'>('success');

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
    React.useEffect(() => {
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
            const adjustmentQuantity = newStockLevel - currentStock;
            
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

    React.useEffect(() => {
        fetchData();
        fetchProducts();
    }, []);

    // Filter data based on search
    const filteredData = data.filter((row) => {
        const searchText = search.toLowerCase();
        return (
            row.id.toLowerCase().includes(searchText) ||
            row.product_id.toLowerCase().includes(searchText) ||
            row.movement_type.toLowerCase().includes(searchText) ||
            (row.reason?.toLowerCase().includes(searchText) ?? false)
        );
    });

    // Add validation check for data
    if (!data || !Array.isArray(data)) {
        console.error('Invalid data:', data);
        return (
            <Typography sx={{ color: 'red' }}>Failed to load stock movements. Please try again later.</Typography>
        );
    }    return (
        <PageLayout>
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
                                <td colSpan={6} style={{ textAlign: 'center', color: '#888', ...typographyStyles }}>No stock movements found.</td>
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
                                        color={
                                            row.movement_type === 'incoming' ? 'success' :
                                            row.movement_type === 'outgoing' ? 'danger' : 
                                            'warning'
                                        }
                                    >
                                        {row.movement_type === 'incoming' ? '↑ Incoming' :
                                         row.movement_type === 'outgoing' ? '↓ Outgoing' :
                                         '⚖ Adjustment'}
                                    </Chip>
                                </td>
                                <td style={typographyStyles}>
                                    <span style={{ 
                                        fontWeight: 'bold',
                                        color: (() => {
                                            if (row.movement_type === 'incoming') return '#059669'; // green
                                            if (row.movement_type === 'outgoing') return '#dc2626'; // red
                                            if (row.movement_type === 'adjustment') {
                                                // Use signed quantity to determine color
                                                return row.quantity >= 0 ? '#059669' : '#dc2626'; // green for +, red for -
                                            }
                                            return '#666';
                                        })()
                                    }}>
                                        {(() => {
                                            if (row.movement_type === 'incoming') return `+${row.quantity}`;
                                            if (row.movement_type === 'outgoing') return `-${row.quantity}`;
                                            if (row.movement_type === 'adjustment') {
                                                // Quantity is now signed - positive or negative
                                                return row.quantity >= 0 ? `+${row.quantity}` : `${row.quantity}`;
                                            }
                                            return row.quantity;
                                        })()}
                                    </span>
                                </td>
                                <td style={typographyStyles}>{row.reason || 'N/A'}</td>
                                <td style={typographyStyles}>{new Date(row.date).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            {/* Manual Adjustment Dialog */}
            <Modal open={adjustmentDialogOpen} onClose={() => setAdjustmentDialogOpen(false)}>
                <ModalDialog sx={{ minWidth: 400, maxWidth: 500 }}>
                    <ModalClose />
                    <Typography level="h4" sx={{ mb: 2 }}>Manual Stock Adjustment</Typography>
                    
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
                                    onChange={(e) => setActualStockLevel(e.target.value === '' ? '' : Number(e.target.value))}
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
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
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
        </PageLayout>
    );
};

export default PageMovementsDesktop;
