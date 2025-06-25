import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

// Define the type for stock movements
type StockMovement = {
    id: string;
    product_id: string;
    movement_type: string;
    quantity: number;
    reason: string | null;
    date: string;
};

const PageMovementsDesktop = () => {
    // Update the state type to use StockMovement
    const [data, setData] = useState<StockMovement[]>([]);

    useEffect(() => {
        async function fetchData() {
            const { data, error } = await supabase
                .from('stock_movements')
                .select('*');

            if (error) {
                console.error('Error fetching stock movements:', error);
            } else {
                setData(data);
            }
        }

        fetchData();
    }, []);

    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '100dvh',
                bgcolor: 'background.body',
                borderRadius: 2,
                boxShadow: 2,
                p: 4,
            }}
        >
            <Typography variant="h4" gutterBottom>
                Stock Movements
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Product ID</TableCell>
                            <TableCell>Movement Type</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Reason</TableCell>
                            <TableCell>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.id}</TableCell>
                                <TableCell>{row.product_id}</TableCell>
                                <TableCell>{row.movement_type}</TableCell>
                                <TableCell>{row.quantity}</TableCell>
                                <TableCell>{row.reason || 'N/A'}</TableCell>
                                <TableCell>{new Date(row.date).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default PageMovementsDesktop;
