import * as React from 'react';
import { supabase } from '../../utils/supabaseClient';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import Chip from '@mui/joy/Chip';
import Input from '@mui/joy/Input';
import SearchIcon from '@mui/icons-material/Search';
import fonts from '../../theme/fonts';
import type { Database } from '../general/supabase.types';
import DialogInventory from '../Dialog/DialogInventory';

const typographyStyles = { fontSize: fonts.sizes.small };

type Product = Database['public']['Tables']['Products']['Row'];

const PageInventoryDesktop = () => {
    const [products, setProducts] = React.useState<Product[]>([]);
    const [search, setSearch] = React.useState('');
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);

    React.useEffect(() => {
        async function fetchProducts() {
            const { data, error } = await supabase
                .from('Products')
                .select('*');
            if (error) {
                console.error('Error fetching products:', error);
            } else {
                setProducts(data || []);
            }
        }
        fetchProducts();
    }, []);

    const filteredProducts = products.filter((product) => {
        const searchText = search.toLowerCase();
        return (
            (product.ProductName?.toLowerCase().includes(searchText) ?? false) ||
            (product.ProductID !== null && product.ProductID !== undefined && product.ProductID.toString().toLowerCase().includes(searchText)) ||
            (product.uuid?.toLowerCase().includes(searchText) ?? false)
        );
    });

    const handleRowClick = (product: Product) => {
        setSelectedProduct(product);
        setDialogOpen(true);
    };

    const handleDialogSave = async (values: { min_stock: number; max_stock: number; reorder_amount: number }) => {
        if (!selectedProduct) return;
        const { error } = await supabase
            .from('Products')
            .update(values)
            .eq('uuid', selectedProduct.uuid);
        if (!error) {
            setProducts(products => products.map(p => p.uuid === selectedProduct.uuid ? { ...p, ...values } : p));
            setDialogOpen(false);
        } else {
            alert('Failed to update product: ' + error.message);
        }
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.body', borderRadius: 0, boxShadow: 'none', p: 0 }}>
            <Typography level="h2" sx={{ mb: 2, textAlign: 'left', fontSize: fonts.sizes.xlarge }}>
                Inventory
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Input
                    placeholder="Search products..."
                    sx={{ flex: 1, ...typographyStyles }}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    startDecorator={<SearchIcon />}
                />
            </Box>
            <Card>
                <Table aria-label="Inventory Levels" sx={{ minWidth: 800 }}>
                    <thead>
                        <tr>
                            <th style={typographyStyles}>Product Name</th>
                            <th style={typographyStyles}>SKU</th>
                            <th style={typographyStyles}>Current Stock</th>
                            <th style={typographyStyles}>Min Stock</th>
                            <th style={typographyStyles}>Max Stock</th>
                            <th style={typographyStyles}>Reorder Amount</th>
                            <th style={typographyStyles}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', color: '#888', ...typographyStyles }}>No products found.</td>
                            </tr>
                        )}
                        {filteredProducts.map((product) => {
                            const isLow = typeof product.min_stock === 'number' && product.min_stock > 0;

                            return (
                                <tr key={product.uuid} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(product)}>
                                    <td style={typographyStyles}>{product.ProductName}</td>
                                    <td style={typographyStyles}>{product.ProductID}</td>
                                    <td style={typographyStyles}>N/A</td>
                                    <td style={typographyStyles}>{product.min_stock ?? 'N/A'}</td>
                                    <td style={typographyStyles}>{product.max_stock ?? 'N/A'}</td>
                                    <td style={typographyStyles}>{product.reorder_amount ?? 'N/A'}</td>
                                    <td>
                                        {isLow ? (
                                            <Chip color="danger" variant="soft" size="sm" sx={typographyStyles}>
                                                Low Stock
                                            </Chip>
                                        ) : (
                                            <Chip color="success" variant="soft" size="sm" sx={typographyStyles}>
                                                OK
                                            </Chip>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Card>
            <DialogInventory
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                product={selectedProduct}
                onSave={handleDialogSave}
            />
        </Box>
    );
};

export default PageInventoryDesktop;
