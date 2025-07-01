import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';

// Define the type for stock movements
type StockMovement = {
    id: string;
    product_id: string;
    movement_type: string;
    quantity: number;
    reason: string | null;
    date: string;
};

const PageMovementsMobile = () => {
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
                p: 2,
            }}
        >
            <Typography variant="h5" gutterBottom>
                Stock Movements
            </Typography>
            <List>
                {data.map((row) => (
                    <ListItem key={row.id}>
                        <ListItemText
                            primary={`Product ID: ${row.product_id}`}
                            secondary={`Type: ${row.movement_type}, Quantity: ${row.quantity}, Date: ${new Date(row.date).toLocaleString()}`}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default PageMovementsMobile;
