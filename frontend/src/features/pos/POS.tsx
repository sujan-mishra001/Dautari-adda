import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    CircularProgress,
    Menu,
    MenuItem as MuiMenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { tablesAPI, ordersAPI } from '../../services/api';

interface Table {
    id: number;
    table_id: string;
    status: 'Vacant' | 'Occupied' | 'Reserved';
    floor: string;
    is_hold_table?: string;
    hold_table_name?: string;
}

const POS: React.FC = () => {
    const navigate = useNavigate();
    const [floorTab, setFloorTab] = useState(0);
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableAmounts, setTableAmounts] = useState<Record<number, number>>({});
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedTableForMenu, setSelectedTableForMenu] = useState<Table | null>(null);

    useEffect(() => {
        loadTables();
        loadTableAmounts();
    }, []);

    const loadTables = async () => {
        try {
            setLoading(true);
            const response = await tablesAPI.getAll();
            setTables(response.data || []);
        } catch (error) {
            setTables([]);
        } finally {
            setLoading(false);
        }
    };

    const loadTableAmounts = async () => {
        try {
            const response = await ordersAPI.getAll();
            const amounts: Record<number, number> = {};
            (response.data || []).forEach((order: any) => {
                if (order.table_id && !['Completed', 'Cancelled', 'Paid'].includes(order.status)) {
                    amounts[order.table_id] = (amounts[order.table_id] || 0) + (order.net_amount || 0);
                }
            });
            setTableAmounts(amounts);
        } catch (error) { }
    };

    const handleTableClick = (event: React.MouseEvent<HTMLElement>, table: Table) => {
        setAnchorEl(event.currentTarget);
        setSelectedTableForMenu(table);
    };

    const handleAction = (type: 'order' | 'billing') => {
        if (!selectedTableForMenu) return;
        navigate(`/pos/${type}/${selectedTableForMenu.id}`, { state: { table: selectedTableForMenu } });
        setAnchorEl(null);
    };

    const floors = Array.from(new Set(tables.map(t => t.floor).filter(f => f && f !== 'Hold Table')));
    const filteredTables = tables.filter(t => floorTab < floors.length ? t.floor === floors[floorTab] : t.floor === 'Hold Table');

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                    <Tabs value={floorTab} onChange={(_, v) => setFloorTab(v)}>
                        {floors.map((floor, idx) => <Tab key={idx} label={floor.toUpperCase()} />)}
                        <Tab label="Hold Table" value={floors.length} />
                    </Tabs>
                </Box>

                {loading ? <CircularProgress /> : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 3 }}>
                        {filteredTables.map((table) => (
                            <Paper
                                key={table.id}
                                onClick={(e) => handleTableClick(e, table)}
                                sx={{ p: 3, textAlign: 'center', cursor: 'pointer', border: '2px solid', borderColor: table.status === 'Vacant' ? '#22c55e' : '#FF5F00' }}
                            >
                                <Typography variant="h6">{table.table_id}</Typography>
                                <Typography variant="caption">{table.status}</Typography>
                                {tableAmounts[table.id] > 0 && <Typography variant="body2">Rs. {tableAmounts[table.id]}</Typography>}
                            </Paper>
                        ))}
                    </Box>
                )}
            </Box>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MuiMenuItem onClick={() => handleAction('order')}>Order Taking</MuiMenuItem>
                <MuiMenuItem onClick={() => handleAction('billing')}>Billing</MuiMenuItem>
            </Menu>
        </Box>
    );
};

export default POS;
