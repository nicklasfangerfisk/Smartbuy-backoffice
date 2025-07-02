// Updated TypeScript code for Option 1 (Signed Quantities)

// Calculate current stock level for a specific product (MUCH SIMPLER!)
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
            // SIMPLE CALCULATION - just sum all quantities!
            const totalStock = (data || []).reduce((total, movement) => {
                switch (movement.movement_type) {
                    case 'incoming':
                        return total + movement.quantity;
                    case 'outgoing':
                        return total - movement.quantity;
                    case 'adjustment':
                        return total + movement.quantity; // quantity is already signed (+/-)
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

// Create adjustment (MUCH CLEANER!)
const handleCreateAdjustment = async () => {
    if (!selectedProductId || actualStockLevel === '' || currentStock === null) {
        alert('Please select a product and enter a valid stock level');
        return;
    }

    const newStockLevel = Number(actualStockLevel);
    const adjustmentQuantity = newStockLevel - currentStock;

    // If no change, don't proceed
    if (adjustmentQuantity === 0) {
        alert('No adjustment needed - the stock level is already at the specified amount');
        return;
    }

    setIsLoading(true);
    try {
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
            alert('Failed to create adjustment: ' + error.message);
        } else {
            // Reset form and refresh
            setSelectedProductId('');
            setActualStockLevel('');
            setAdjustmentReason('');
            setCurrentStock(null);
            setAdjustmentDialogOpen(false);
            fetchData();
            alert('Stock adjustment created successfully!');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        alert('An unexpected error occurred');
    } finally {
        setIsLoading(false);
    }
};
