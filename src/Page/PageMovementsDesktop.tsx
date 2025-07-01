/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import { ColorPaletteProp } from '@mui/joy/styles';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Link from '@mui/joy/Link';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Checkbox from '@mui/joy/Checkbox';
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import { supabase } from '../utils/supabaseClient';
import OrderTableCreate from '../Dialog/OrderTableCreate';
import OrderTableDetails from '../Dialog/OrderTableDetails';
import useMediaQuery from '@mui/material/useMediaQuery';
import PageOrderMobile, { PageOrderMobileItem } from './PageOrderMobile';
import Card from '@mui/joy/Card';
import LinearProgress from '@mui/joy/LinearProgress';

// No handleOrderClick utility found. If needed, define locally or use inline logic.

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import fonts from '../../theme/fonts';
import type { Database } from '../general/supabase.types';
import PageLayout from '../layouts/PageLayout';

// Define the type for stock movements
type StockMovement = Database['public']['Tables']['stock_movements']['Row'];

// Apply font size to Typography components
const typographyStyles = { fontSize: fonts.sizes.small };

const PageMovementsDesktop = () => {
    const [data, setData] = React.useState<StockMovement[]>([]);
    const [search, setSearch] = React.useState('');

    React.useEffect(() => {
        async function fetchData() {
            const { data, error } = await supabase
                .from('stock_movements')
                .select('*');

            if (error) {
                console.error('Error fetching stock movements:', error);
            } else {
                setData(data || []);
            }
        }

        fetchData();
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
    }

    return (
        <PageLayout>
            <Box
                sx={{
                    width: '100%',
                    minHeight: '100dvh',
                    bgcolor: 'background.body',
                    borderRadius: 0,
                    boxShadow: 'none',
                    pl: 0,
                    pr: 0,
                    pt: 3, // 24px top padding (theme spacing unit 3 = 24px)
                    pb: 0,
                }}
            >
                <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge, textAlign: 'left' }}>
                    Stock Movements
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Input
                        placeholder="Search movements..."
                        sx={{ flex: 1, ...typographyStyles }}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        startDecorator={<SearchIcon />}
                    />
                </Box>
                <Card>
                    <Table aria-label="Stock Movements" sx={{ minWidth: 800 }}>
                        <thead>
                            <tr>
                                <th style={typographyStyles}>ID</th>
                                <th style={typographyStyles}>Product ID</th>
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
                                    <td style={typographyStyles}>{row.id}</td>
                                    <td style={typographyStyles}>{row.product_id}</td>
                                    <td style={typographyStyles}>{row.movement_type}</td>
                                    <td style={typographyStyles}>{row.quantity}</td>
                                    <td style={typographyStyles}>{row.reason || 'N/A'}</td>
                                    <td style={typographyStyles}>{new Date(row.date).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            </Box>
        </PageLayout>
    );
};

export default PageMovementsDesktop;
