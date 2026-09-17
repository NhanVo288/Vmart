import { useState, useMemo, useRef, useCallback, useLayoutEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box, Typography, Paper, TextField, InputAdornment, Chip, IconButton, Collapse,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import KeyIcon from '@mui/icons-material/Key';
import LinkIcon from '@mui/icons-material/Link';
import TableChartIcon from '@mui/icons-material/TableChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';

/* ── Types ── */

interface Column {
  order: number;
  name: string;
  type: string;
  maxLength: number;
  nullable: boolean;
  isPk?: boolean;
}

interface Table {
  name: string;
  columns: Column[];
}

interface Relation {
  from: string;
  to: string;
  fromCol: string;
  toCol: string;
  type: '1:1' | '1:N' | 'N:M';
}

interface Pos { x: number; y: number; }

/* ── Schema Data ── */

const TABLES: Table[] = [
  {
    name: 'AspNetUsers',
    columns: [
      { order: 1, name: 'Id', type: 'nvarchar', maxLength: 900, nullable: false, isPk: true },
      { order: 2, name: 'UserName', type: 'nvarchar', maxLength: 512, nullable: true },
      { order: 3, name: 'NormalizedUserName', type: 'nvarchar', maxLength: 512, nullable: true },
      { order: 4, name: 'Email', type: 'nvarchar', maxLength: 512, nullable: true },
      { order: 5, name: 'NormalizedEmail', type: 'nvarchar', maxLength: 512, nullable: true },
      { order: 6, name: 'EmailConfirmed', type: 'bit', maxLength: 1, nullable: false },
      { order: 7, name: 'PasswordHash', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 8, name: 'SecurityStamp', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 9, name: 'ConcurrencyStamp', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 10, name: 'PhoneNumber', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 11, name: 'PhoneNumberConfirmed', type: 'bit', maxLength: 1, nullable: false },
      { order: 12, name: 'TwoFactorEnabled', type: 'bit', maxLength: 1, nullable: false },
      { order: 13, name: 'LockoutEnd', type: 'datetimeoffset', maxLength: 10, nullable: true },
      { order: 14, name: 'LockoutEnabled', type: 'bit', maxLength: 1, nullable: false },
      { order: 15, name: 'AccessFailedCount', type: 'int', maxLength: 4, nullable: false },
      { order: 17, name: 'Address_City', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 18, name: 'Address_Country', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 19, name: 'Address_Line1', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 20, name: 'Address_Line2', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 21, name: 'Address_Name', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 22, name: 'Address_PostalCode', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 23, name: 'Address_State', type: 'nvarchar', maxLength: -1, nullable: true },
    ],
  },
  {
    name: 'AspNetRoles',
    columns: [
      { order: 1, name: 'Id', type: 'nvarchar', maxLength: 900, nullable: false, isPk: true },
      { order: 2, name: 'Name', type: 'nvarchar', maxLength: 512, nullable: true },
      { order: 3, name: 'NormalizedName', type: 'nvarchar', maxLength: 512, nullable: true },
      { order: 4, name: 'ConcurrencyStamp', type: 'nvarchar', maxLength: -1, nullable: true },
    ],
  },
  {
    name: 'AspNetUserRoles',
    columns: [
      { order: 1, name: 'UserId', type: 'nvarchar', maxLength: 900, nullable: false },
      { order: 2, name: 'RoleId', type: 'nvarchar', maxLength: 900, nullable: false },
    ],
  },
  {
    name: 'AspNetUserClaims',
    columns: [
      { order: 1, name: 'Id', type: 'int', maxLength: 4, nullable: false, isPk: true },
      { order: 2, name: 'UserId', type: 'nvarchar', maxLength: 900, nullable: false },
      { order: 3, name: 'ClaimType', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 4, name: 'ClaimValue', type: 'nvarchar', maxLength: -1, nullable: true },
    ],
  },
  {
    name: 'AspNetRoleClaims',
    columns: [
      { order: 1, name: 'Id', type: 'int', maxLength: 4, nullable: false, isPk: true },
      { order: 2, name: 'RoleId', type: 'nvarchar', maxLength: 900, nullable: false },
      { order: 3, name: 'ClaimType', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 4, name: 'ClaimValue', type: 'nvarchar', maxLength: -1, nullable: true },
    ],
  },
  {
    name: 'AspNetUserLogins',
    columns: [
      { order: 1, name: 'LoginProvider', type: 'nvarchar', maxLength: 900, nullable: false },
      { order: 2, name: 'ProviderKey', type: 'nvarchar', maxLength: 900, nullable: false },
      { order: 3, name: 'ProviderDisplayName', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 4, name: 'UserId', type: 'nvarchar', maxLength: 900, nullable: false },
    ],
  },
  {
    name: 'AspNetUserTokens',
    columns: [
      { order: 1, name: 'UserId', type: 'nvarchar', maxLength: 900, nullable: false },
      { order: 2, name: 'LoginProvider', type: 'nvarchar', maxLength: 900, nullable: false },
      { order: 3, name: 'Name', type: 'nvarchar', maxLength: 900, nullable: false },
      { order: 4, name: 'Value', type: 'nvarchar', maxLength: -1, nullable: true },
    ],
  },
  {
    name: 'Baskets',
    columns: [
      { order: 1, name: 'Id', type: 'int', maxLength: 4, nullable: false, isPk: true },
      { order: 2, name: 'BuyerId', type: 'nvarchar', maxLength: -1, nullable: false },
      { order: 3, name: 'PaymentQrUrl', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 4, name: 'PaymentReference', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 5, name: 'DeliveryFee', type: 'bigint', maxLength: 8, nullable: false },
      { order: 6, name: 'Discount', type: 'bigint', maxLength: 8, nullable: false },
      { order: 7, name: 'ShipCity', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 8, name: 'ShipCountry', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 9, name: 'ShipLine1', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 10, name: 'ShipLine2', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 11, name: 'ShipName', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 12, name: 'ShipPostalCode', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 13, name: 'ShipState', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 14, name: 'IsAnonymous', type: 'bit', maxLength: 1, nullable: false },
      { order: 15, name: 'LastModifiedAt', type: 'datetime2', maxLength: 8, nullable: false },
    ],
  },
  {
    name: 'BasketItem',
    columns: [
      { order: 1, name: 'Id', type: 'int', maxLength: 4, nullable: false, isPk: true },
      { order: 2, name: 'Quantity', type: 'int', maxLength: 4, nullable: false },
      { order: 3, name: 'ProductId', type: 'int', maxLength: 4, nullable: false },
      { order: 4, name: 'BasketId', type: 'int', maxLength: 4, nullable: false },
    ],
  },
  {
    name: 'Products',
    columns: [
      { order: 1, name: 'Id', type: 'int', maxLength: 4, nullable: false, isPk: true },
      { order: 2, name: 'Name', type: 'nvarchar', maxLength: -1, nullable: false },
      { order: 3, name: 'Description', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 4, name: 'Price', type: 'decimal', maxLength: 9, nullable: false },
      { order: 5, name: 'PictureUrl', type: 'nvarchar', maxLength: -1, nullable: false },
      { order: 6, name: 'Type', type: 'nvarchar', maxLength: -1, nullable: false },
      { order: 7, name: 'Brand', type: 'nvarchar', maxLength: -1, nullable: false },
      { order: 8, name: 'QuantityInStock', type: 'int', maxLength: 4, nullable: false },
    ],
  },
  {
    name: 'Favorites',
    columns: [
      { order: 1, name: 'Id', type: 'int', maxLength: 4, nullable: false, isPk: true },
      { order: 2, name: 'BuyerId', type: 'nvarchar', maxLength: -1, nullable: false },
    ],
  },
  {
    name: 'FavoriteItems',
    columns: [
      { order: 1, name: 'Id', type: 'int', maxLength: 4, nullable: false, isPk: true },
      { order: 2, name: 'ProductId', type: 'int', maxLength: 4, nullable: false },
      { order: 3, name: 'FavoriteId', type: 'int', maxLength: 4, nullable: false },
    ],
  },
  {
    name: 'Orders',
    columns: [
      { order: 1, name: 'Id', type: 'int', maxLength: 4, nullable: false, isPk: true },
      { order: 2, name: 'BuyerId', type: 'nvarchar', maxLength: -1, nullable: false },
      { order: 3, name: 'OrderDate', type: 'datetime2', maxLength: 8, nullable: false },
      { order: 4, name: 'Subtotal', type: 'decimal', maxLength: 9, nullable: false },
      { order: 5, name: 'DeliveryFee', type: 'bigint', maxLength: 8, nullable: false },
      { order: 6, name: 'Discount', type: 'bigint', maxLength: 8, nullable: false },
      { order: 7, name: 'Status', type: 'int', maxLength: 4, nullable: false },
      { order: 8, name: 'ShippingAddress_Address_Name', type: 'nvarchar', maxLength: -1, nullable: false },
      { order: 9, name: 'ShippingAddress_Address_Line1', type: 'nvarchar', maxLength: -1, nullable: false },
      { order: 10, name: 'ShippingAddress_Address_Line2', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 11, name: 'ShippingAddress_Address_City', type: 'nvarchar', maxLength: -1, nullable: false },
      { order: 12, name: 'ShippingAddress_Address_State', type: 'nvarchar', maxLength: -1, nullable: false },
      { order: 13, name: 'ShippingAddress_Address_PostalCode', type: 'nvarchar', maxLength: -1, nullable: false },
      { order: 14, name: 'ShippingAddress_Address_Country', type: 'nvarchar', maxLength: -1, nullable: false },
    ],
  },
  {
    name: 'OrderItems',
    columns: [
      { order: 1, name: 'Id', type: 'int', maxLength: 4, nullable: false, isPk: true },
      { order: 2, name: 'ItemOrdered_ProductId', type: 'int', maxLength: 4, nullable: false },
      { order: 3, name: 'ItemOrdered_ProductName', type: 'nvarchar', maxLength: -1, nullable: false },
      { order: 4, name: 'ItemOrdered_PictureUrl', type: 'nvarchar', maxLength: -1, nullable: false },
      { order: 5, name: 'Price', type: 'decimal', maxLength: 9, nullable: false },
      { order: 6, name: 'Quantity', type: 'int', maxLength: 4, nullable: false },
      { order: 7, name: 'OrderId', type: 'int', maxLength: 4, nullable: true },
    ],
  },
  {
    name: 'AdminNotifications',
    columns: [
      { order: 1, name: 'Id', type: 'int', maxLength: 4, nullable: false, isPk: true },
      { order: 2, name: 'Action', type: 'nvarchar', maxLength: -1, nullable: false },
      { order: 3, name: 'ProductId', type: 'int', maxLength: 4, nullable: false },
      { order: 4, name: 'ProductName', type: 'nvarchar', maxLength: -1, nullable: false },
      { order: 5, name: 'VendorId', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 6, name: 'VendorName', type: 'nvarchar', maxLength: -1, nullable: true },
      { order: 7, name: 'Message', type: 'nvarchar', maxLength: -1, nullable: false },
      { order: 8, name: 'CreatedAt', type: 'datetime2', maxLength: 8, nullable: false },
      { order: 9, name: 'IsRead', type: 'bit', maxLength: 1, nullable: false },
    ],
  },
];

const RELATIONS: Relation[] = [
  { from: 'AspNetUserRoles', to: 'AspNetUsers', fromCol: 'UserId', toCol: 'Id', type: 'N:M' },
  { from: 'AspNetUserRoles', to: 'AspNetRoles', fromCol: 'RoleId', toCol: 'Id', type: 'N:M' },
  { from: 'AspNetUserClaims', to: 'AspNetUsers', fromCol: 'UserId', toCol: 'Id', type: '1:N' },
  { from: 'AspNetRoleClaims', to: 'AspNetRoles', fromCol: 'RoleId', toCol: 'Id', type: '1:N' },
  { from: 'AspNetUserLogins', to: 'AspNetUsers', fromCol: 'UserId', toCol: 'Id', type: '1:N' },
  { from: 'AspNetUserTokens', to: 'AspNetUsers', fromCol: 'UserId', toCol: 'Id', type: '1:N' },
  { from: 'Baskets', to: 'AspNetUsers', fromCol: 'BuyerId', toCol: 'Id', type: '1:N' },
  { from: 'BasketItem', to: 'Baskets', fromCol: 'BasketId', toCol: 'Id', type: '1:N' },
  { from: 'BasketItem', to: 'Products', fromCol: 'ProductId', toCol: 'Id', type: '1:N' },
  { from: 'Favorites', to: 'AspNetUsers', fromCol: 'BuyerId', toCol: 'Id', type: '1:1' },
  { from: 'FavoriteItems', to: 'Favorites', fromCol: 'FavoriteId', toCol: 'Id', type: '1:N' },
  { from: 'FavoriteItems', to: 'Products', fromCol: 'ProductId', toCol: 'Id', type: '1:N' },
  { from: 'Orders', to: 'AspNetUsers', fromCol: 'BuyerId', toCol: 'Id', type: '1:N' },
  { from: 'OrderItems', to: 'Orders', fromCol: 'OrderId', toCol: 'Id', type: '1:N' },
];

/* ── Layout Constants ── */

const CARD_W = 340;
const CARD_H_GRID = 130;
const COLS = 3;
const GAP_X = 32;
const GAP_Y = 28;
const PAD = 20;

/* ── Helpers ── */

function typeColor(type: string, dark: boolean): string {
  const map: Record<string, [string, string]> = {
    int: ['#0ea5e9', '#38bdf8'],
    bigint: ['#0284c7', '#7dd3fc'],
    decimal: ['#8b5cf6', '#c4b5fd'],
    nvarchar: ['#6366f1', '#a5b4fc'],
    bit: ['#16a34a', '#4ade80'],
    datetime2: ['#d97706', '#fbbf24'],
    datetimeoffset: ['#ea580c', '#fb923c'],
  };
  const [l, d] = map[type] || ['#64748b', '#94a3b8'];
  return dark ? d : l;
}

function typeBg(type: string, dark: boolean): string {
  const map: Record<string, [string, string]> = {
    int: ['rgba(14,165,233,0.08)', 'rgba(56,189,248,0.1)'],
    bigint: ['rgba(2,132,199,0.08)', 'rgba(125,211,252,0.1)'],
    decimal: ['rgba(139,92,246,0.08)', 'rgba(196,181,253,0.1)'],
    nvarchar: ['rgba(99,102,241,0.08)', 'rgba(165,180,252,0.1)'],
    bit: ['rgba(22,163,74,0.08)', 'rgba(74,222,128,0.1)'],
    datetime2: ['rgba(217,119,6,0.08)', 'rgba(251,191,36,0.1)'],
    datetimeoffset: ['rgba(234,88,12,0.08)', 'rgba(251,146,60,0.1)'],
  };
  const [l, d] = map[type] || ['rgba(100,116,139,0.08)', 'rgba(148,163,184,0.1)'];
  return dark ? d : l;
}

function getTableColor(name: string): string {
  if (name.startsWith('AspNet')) return '#6366f1';
  if (name === 'Products') return '#7c3aed';
  if (name.includes('Basket') || name.includes('Favorite')) return '#0284c7';
  if (name.includes('Order')) return '#16a34a';
  if (name.includes('Admin')) return '#d97706';
  return '#64748b';
}

function relationTypeInfo(type: '1:1' | '1:N' | 'N:M', dark: boolean) {
  const map = {
    '1:1': { label: 'One-to-One', short: '1 : 1', light: '#0284c7', dark: '#38bdf8' },
    '1:N': { label: 'One-to-Many', short: '1 : N', light: '#7c3aed', dark: '#c4b5fd' },
    'N:M': { label: 'Many-to-Many', short: 'N : M', light: '#d97706', dark: '#fbbf24' },
  };
  const info = map[type];
  const c = dark ? info.dark : info.light;
  return { ...info, color: c, bg: dark ? `${c}18` : `${c}0c`, border: dark ? `${c}35` : `${c}20` };
}

function getRelatedTables(name: string): Set<string> {
  const related = new Set<string>();
  RELATIONS.forEach((r) => {
    if (r.from === name) related.add(r.to);
    if (r.to === name) related.add(r.from);
  });
  return related;
}

function getTableRelations(name: string): Relation[] {
  return RELATIONS.filter((r) => r.from === name || r.to === name);
}

/* ── Position Calculation ── */

function getCardH(table: Table, expanded: Set<string>): number {
  if (!expanded.has(table.name)) return CARD_H_GRID;

  const headerH = 56;
  const chipsRowH = 30;
  const chipW = 70;
  const chipH = 22;
  const chipGap = 4;
  const chipsPerRow = Math.floor((CARD_W - 40) / (chipW + chipGap));
  const chipRows = Math.ceil(table.columns.length / chipsPerRow);
  const chipsSectionH = chipRows * (chipH + chipGap) + 12;

  const relations = getTableRelations(table.name);
  const fkTitleH = 28;
  const fkRowH = 36;
  const fkSectionH = relations.length > 0 ? fkTitleH + relations.length * fkRowH + 8 : 0;

  const colTitleH = 28;
  const colRowH = 28;
  const colSectionH = colTitleH + table.columns.length * colRowH + 8;

  return headerH + chipsRowH + chipsSectionH + fkSectionH + colSectionH + 24;
}

function calcGridPositions(tables: Table[], expanded: Set<string>): Map<string, Pos> {
  const pos = new Map<string, Pos>();
  const colWidth = CARD_W + GAP_X;

  // Build rows
  const rows: Table[][] = [];
  for (let i = 0; i < tables.length; i += COLS) {
    rows.push(tables.slice(i, i + COLS));
  }

  let y = PAD;
  rows.forEach((row) => {
    const maxH = Math.max(...row.map((t) => getCardH(t, expanded)));
    row.forEach((t, col) => {
      pos.set(t.name, { x: PAD + col * colWidth, y });
    });
    y += maxH + GAP_Y;
  });
  return pos;
}

function calcClusterPositions(
  tables: Table[],
  selected: string,
  expanded: Set<string>,
): Map<string, Pos> {
  const pos = new Map<string, Pos>();
  const related = getRelatedTables(selected);
  const relatedArr = tables.filter((t) => related.has(t.name) && t.name !== selected);
  const others = tables.filter((t) => !related.has(t.name) && t.name !== selected);

  const centerX = 520;
  const centerY = 360;

  // Selected table at center
  pos.set(selected, { x: centerX - CARD_W / 2, y: centerY - CARD_H_GRID / 2 });

  // Related tables in a circle around selected
  const innerRadius = 400;
  const angleStep = relatedArr.length > 0 ? (2 * Math.PI) / relatedArr.length : 0;
  relatedArr.forEach((t, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const h = getCardH(t, expanded);
    pos.set(t.name, {
      x: centerX + Math.cos(angle) * innerRadius - CARD_W / 2,
      y: centerY + Math.sin(angle) * innerRadius - h / 2,
    });
  });

  // Others go to a completely separate area far below
  const selTable = tables.find((t) => t.name === selected);
  const selH = selTable ? getCardH(selTable, expanded) : CARD_H_GRID;
  const clusterMaxY = Math.max(
    centerY + innerRadius + selH,
    ...relatedArr.map((t) => {
      const p = pos.get(t.name);
      return p ? p.y + getCardH(t, expanded) : 0;
    }),
  );
  const separatorGap = 160;
  const outerStartY = clusterMaxY + separatorGap;

  // Group others into rows with proper height calculation
  const outerCols = 3;
  const colWidth = CARD_W + GAP_X;
  const totalWidth = outerCols * colWidth;
  const startX = centerX - totalWidth / 2 + colWidth / 2 - CARD_W / 2;

  const rows: Table[][] = [];
  for (let i = 0; i < others.length; i += outerCols) {
    rows.push(others.slice(i, i + outerCols));
  }

  let curY = outerStartY;
  rows.forEach((row) => {
    const maxH = Math.max(...row.map((t) => getCardH(t, expanded)));
    row.forEach((t, col) => {
      pos.set(t.name, { x: startX + col * colWidth, y: curY });
    });
    curY += maxH + GAP_Y;
  });

  return pos;
}

function calcCanvasHeight(tables: Table[], positions: Map<string, Pos>, expanded: Set<string>): number {
  const tableMap = new Map(tables.map((t) => [t.name, t]));
  let maxY = 0;
  positions.forEach((p, name) => {
    const table = tableMap.get(name);
    const h = table ? getCardH(table, expanded) : CARD_H_GRID;
    maxY = Math.max(maxY, p.y + h);
  });
  return maxY + PAD * 2;
}

/* ── Main Component ── */

export function DatabaseDiagram() {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const dark = mode === 'dark';

  const [search, setSearch] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [showRelations, setShowRelations] = useState(true);
  const [positions, setPositions] = useState<Map<string, Pos>>(new Map());
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Pan & Zoom ──
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((z) => Math.min(Math.max(z + delta, 0.3), 2.5));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
    e.preventDefault();
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const zoomIn = () => setZoom((z) => Math.min(z + 0.2, 2.5));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.3));

  const filteredTables = useMemo(() => {
    if (!search.trim()) return TABLES;
    const q = search.toLowerCase();
    return TABLES.filter(
      (t) => t.name.toLowerCase().includes(q) || t.columns.some((c) => c.name.toLowerCase().includes(q)),
    );
  }, [search]);

  const filteredRelations = useMemo(() => {
    const names = new Set(filteredTables.map((t) => t.name));
    return RELATIONS.filter((r) => names.has(r.from) && names.has(r.to));
  }, [filteredTables]);

  const fitToScreen = useCallback(() => {
    if (!containerRef.current || positions.size === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const tableMap = new Map(filteredTables.map((t) => [t.name, t]));
    const pad = 40;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    positions.forEach((p, name) => {
      const table = tableMap.get(name);
      const h = table ? getCardH(table, expandedTables) : CARD_H_GRID;
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x + CARD_W);
      maxY = Math.max(maxY, p.y + h);
    });
    const contentW = maxX - minX;
    const contentH = maxY - minY;
    if (contentW <= 0 || contentH <= 0) return;
    const availW = rect.width - pad * 2;
    const availH = rect.height - pad * 2;
    const newZoom = Math.min(availW / contentW, availH / contentH, 2.5);
    const newPanX = (availW - contentW * newZoom) / 2 + pad - minX * newZoom;
    const newPanY = (availH - contentH * newZoom) / 2 + pad - minY * newZoom;
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [positions, expandedTables, filteredTables]);

  const toggleExpand = (name: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const toggleAll = () => {
    if (expandedTables.size === filteredTables.length) setExpandedTables(new Set());
    else setExpandedTables(new Set(filteredTables.map((t) => t.name)));
  };

  // ── Calculate Positions ──
  useLayoutEffect(() => {
    const newPos = selectedTable
      ? calcClusterPositions(filteredTables, selectedTable, expandedTables)
      : calcGridPositions(filteredTables, expandedTables);
    setPositions(newPos);
  }, [filteredTables, selectedTable, expandedTables]);

  const canvasHeight = useMemo(() => calcCanvasHeight(filteredTables, positions, expandedTables), [filteredTables, positions, expandedTables]);

  // ── Relation Lines ──
  const relationLines = useMemo(() => {
    if (!selectedTable || !showRelations) return [];
    const tableMap = new Map(filteredTables.map((t) => [t.name, t]));
    const lines: { from: Pos; to: Pos; color: string; type: string }[] = [];
    filteredRelations.forEach((r) => {
      const fromPos = positions.get(r.from);
      const toPos = positions.get(r.to);
      if (!fromPos || !toPos) return;
      if (r.from === selectedTable || r.to === selectedTable) {
        const otherColor = getTableColor(r.from === selectedTable ? r.to : r.from);
        const fromTable = tableMap.get(r.from);
        const toTable = tableMap.get(r.to);
        const fromH = fromTable ? getCardH(fromTable, expandedTables) : CARD_H_GRID;
        const toH = toTable ? getCardH(toTable, expandedTables) : CARD_H_GRID;
        lines.push({
          from: { x: fromPos.x + CARD_W / 2, y: fromPos.y + fromH / 2 },
          to: { x: toPos.x + CARD_W / 2, y: toPos.y + toH / 2 },
          color: dark ? `${otherColor}60` : `${otherColor}40`,
          type: r.type,
        });
      }
    });
    return lines;
  }, [selectedTable, positions, filteredRelations, showRelations, dark]);

  const activeTable = selectedTable || hoveredTable;
  const relatedToActive = activeTable ? getRelatedTables(activeTable) : new Set<string>();
  const hasActive = !!activeTable;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Search & Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          fullWidth size="small" placeholder="Search tables or columns..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: dark ? 'rgba(165,180,252,0.5)' : 'rgba(99,102,241,0.4)' }} /></InputAdornment>),
              endAdornment: search ? (<InputAdornment position="end"><IconButton size="small" onClick={() => setSearch('')}><CloseIcon fontSize="small" /></IconButton></InputAdornment>) : undefined,
            },
          }}
          sx={{ maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 3, background: dark ? 'rgba(99,102,241,0.05)' : 'rgba(79,70,229,0.03)', '& fieldset': { borderColor: dark ? 'rgba(99,102,241,0.15)' : 'rgba(79,70,229,0.1)' }, '&:hover fieldset': { borderColor: dark ? 'rgba(99,102,241,0.3)' : 'rgba(79,70,229,0.2)' }, '&.Mui-focused fieldset': { borderColor: dark ? '#818cf8' : '#4f46e5' } } }}
        />
        <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto' }}>
          <Chip label={showRelations ? 'Hide Relations' : 'Show Relations'} onClick={() => setShowRelations(!showRelations)} size="small" icon={<LinkIcon sx={{ fontSize: '16px !important' }} />}
            sx={{ fontWeight: 600, fontSize: '0.75rem', height: 32, background: showRelations ? dark ? 'rgba(74,222,128,0.12)' : 'rgba(22,163,74,0.08)' : dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: showRelations ? dark ? '#4ade80' : '#16a34a' : dark ? '#94a3b8' : '#64748b', border: '1px solid', borderColor: showRelations ? dark ? 'rgba(74,222,128,0.2)' : 'rgba(22,163,74,0.15)' : 'divider', '&:hover': { background: showRelations ? dark ? 'rgba(74,222,128,0.18)' : 'rgba(22,163,74,0.12)' : dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' } }} />
          <Chip label={expandedTables.size === filteredTables.length ? 'Collapse All' : 'Expand All'} onClick={toggleAll} size="small"
            icon={<ExpandMoreIcon sx={{ fontSize: '16px !important', transition: 'transform 0.3s', transform: expandedTables.size === filteredTables.length ? 'rotate(180deg)' : 'none' }} />}
            sx={{ fontWeight: 600, fontSize: '0.75rem', height: 32, background: dark ? 'rgba(99,102,241,0.1)' : 'rgba(79,70,229,0.06)', color: dark ? '#a5b4fc' : '#4f46e5', border: `1px solid ${dark ? 'rgba(99,102,241,0.2)' : 'rgba(79,70,229,0.12)'}`, '&:hover': { background: dark ? 'rgba(99,102,241,0.18)' : 'rgba(79,70,229,0.1)' } }} />
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[{ label: 'Tables', value: filteredTables.length, color: '#4f46e5' }, { label: 'Columns', value: filteredTables.reduce((s, t) => s + t.columns.length, 0), color: '#7c3aed' }, { label: 'Relations', value: filteredRelations.length, color: '#0284c7' }].map((stat) => (
          <Box key={stat.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: 2, background: dark ? `${stat.color}10` : `${stat.color}08`, border: `1px solid ${stat.color}20` }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: dark ? `${stat.color}dd` : stat.color }}>{stat.value}</Typography>
            <Typography variant="caption" sx={{ color: dark ? 'rgba(203,213,225,0.7)' : '#64748b', fontWeight: 500 }}>{stat.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* ── Canvas ── */}
      <Box
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        sx={{
          overflow: 'hidden', borderRadius: 3, border: '1px solid', borderColor: 'divider',
          background: dark ? 'rgba(15,23,42,0.5)' : 'rgba(248,250,252,0.5)',
          position: 'relative', cursor: isDragging.current ? 'grabbing' : 'grab', userSelect: 'none', minHeight: 500,
        }}
      >
        {/* Zoom Controls */}
        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {[{ label: '+', fn: zoomIn, tip: 'Zoom In' }, { label: '-', fn: zoomOut, tip: 'Zoom Out' }, { label: '\u21bb', fn: resetView, tip: 'Reset View' }, { label: '\u29c9', fn: fitToScreen, tip: 'Fit to Screen' }].map((btn) => (
            <Box key={btn.label} onClick={(e) => { e.stopPropagation(); btn.fn(); }} title={btn.tip}
              sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', background: dark ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.9)', border: '1px solid', borderColor: dark ? 'rgba(99,102,241,0.2)' : 'rgba(79,70,229,0.12)', color: dark ? '#a5b4fc' : '#4f46e5', backdropFilter: 'blur(8px)', transition: 'all 0.2s ease', '&:hover': { background: dark ? 'rgba(99,102,241,0.15)' : 'rgba(79,70,229,0.08)', transform: 'scale(1.1)' } }}>
              {btn.label}
            </Box>
          ))}
          <Box sx={{ mt: 0.5, px: 1, py: 0.3, borderRadius: 1.5, textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'monospace', background: dark ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.9)', border: '1px solid', borderColor: dark ? 'rgba(99,102,241,0.15)' : 'rgba(79,70,229,0.08)', color: dark ? '#a5b4fc' : '#4f46e5', backdropFilter: 'blur(8px)' }}>
            {Math.round(zoom * 100)}%
          </Box>
          <Box onClick={(e) => { e.stopPropagation(); setSelectedTable(null); setExpandedTables(new Set()); resetView(); }} title="Reset All"
            sx={{ mt: 0.5, width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', background: dark ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.9)', border: '1px solid', borderColor: dark ? 'rgba(248,113,113,0.25)' : 'rgba(220,38,38,0.15)', color: dark ? '#f87171' : '#dc2626', backdropFilter: 'blur(8px)', transition: 'all 0.2s ease', '&:hover': { background: dark ? 'rgba(248,113,113,0.15)' : 'rgba(220,38,38,0.08)', transform: 'scale(1.1)' } }}>
            R
          </Box>
        </Box>

        <Box sx={{ position: 'absolute', bottom: 12, left: 12, zIndex: 10, px: 1.5, py: 0.5, borderRadius: 1.5, fontSize: '0.6rem', fontWeight: 500, background: dark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.8)', border: '1px solid', borderColor: dark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.06)', color: dark ? 'rgba(203,213,225,0.5)' : '#94a3b8', backdropFilter: 'blur(8px)', pointerEvents: 'none' }}>
          Drag to pan \u00b7 Scroll to zoom \u00b7 Click table to cluster
        </Box>

        {/* Transformed Layer */}
        <Box ref={canvasRef} sx={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0', transition: isDragging.current ? 'none' : 'transform 0.2s ease-out', position: 'relative', height: canvasHeight, minWidth: '100%' }}>

          {/* SVG Relation Lines */}
          {showRelations && relationLines.length > 0 && (
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={dark ? '#818cf8' : '#4f46e5'} />
                </marker>
              </defs>
              {relationLines.map((line, i) => {
                const dx = line.to.x - line.from.x;
                const dy = line.to.y - line.from.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const nx = dx / len;
                const ny = dy / len;
                const startX = line.from.x + nx * 20;
                const startY = line.from.y + ny * 20;
                const endX = line.to.x - nx * 20;
                const endY = line.to.y - ny * 20;
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;
                const cpx = midX + ny * 30;
                const cpy = midY - nx * 30;
                return (
                  <g key={i}>
                    <path d={`M ${startX} ${startY} Q ${cpx} ${cpy} ${endX} ${endY}`} fill="none" stroke={line.color} strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#arrow)">
                      <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.5s" repeatCount="indefinite" />
                    </path>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Cluster separator */}
          {selectedTable && (() => {
            const related = getRelatedTables(selectedTable);
            const clusterNames = [selectedTable, ...Array.from(related)];
            const tableMap = new Map(filteredTables.map((t) => [t.name, t]));
            let clusterMaxY = 0;
            positions.forEach((p, name) => {
              if (clusterNames.includes(name)) {
                const table = tableMap.get(name);
                const h = table ? getCardH(table, expandedTables) : CARD_H_GRID;
                clusterMaxY = Math.max(clusterMaxY, p.y + h);
              }
            });
            if (clusterMaxY === 0) return null;
            return (
              <Box sx={{
                position: 'absolute',
                left: 0, right: 0,
                top: clusterMaxY + 40,
                zIndex: 0,
                display: 'flex', alignItems: 'center', gap: 2, px: 4,
              }}>
                <Box sx={{ flex: 1, height: 2, background: dark ? 'rgba(99,102,241,0.15)' : 'rgba(79,70,229,0.1)', borderRadius: 1 }} />
                <Typography sx={{
                  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
                  color: dark ? 'rgba(203,213,225,0.35)' : '#94a3b8',
                  whiteSpace: 'nowrap',
                }}>
                  Other Tables
                </Typography>
                <Box sx={{ flex: 1, height: 2, background: dark ? 'rgba(99,102,241,0.15)' : 'rgba(79,70,229,0.1)', borderRadius: 1 }} />
              </Box>
            );
          })()}

          {/* Table Cards */}
          {filteredTables.map((table) => {
            const pos = positions.get(table.name);
            if (!pos) return null;
            const isExpanded = expandedTables.has(table.name);
            const isSelected = selectedTable === table.name;
            const isRelated = hasActive && relatedToActive.has(table.name);
            const isDimmed = hasActive && !isRelated && !isSelected;
            const tableColor = getTableColor(table.name);
            const tableRelations = getTableRelations(table.name);

            return (
              <motion.div
                key={table.name}
                initial={false}
                animate={{ x: pos.x, y: pos.y, opacity: isDimmed ? 0.35 : 1, scale: isDimmed ? 0.95 : isSelected ? 1.03 : 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.8 }}
                style={{ position: 'absolute', width: CARD_W, zIndex: isSelected ? 5 : isRelated ? 3 : 1 }}
              >
                <Paper
                  elevation={0}
                  onMouseEnter={() => setHoveredTable(table.name)}
                  onMouseLeave={() => setHoveredTable(null)}
                  onClick={() => setSelectedTable(isSelected ? null : table.name)}
                  sx={{
                    borderRadius: 3, border: '2px solid', overflow: 'hidden', cursor: 'pointer',
                    borderColor: isSelected ? dark ? `${tableColor}90` : tableColor : isRelated ? dark ? `${tableColor}50` : `${tableColor}60` : 'divider',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                    boxShadow: isSelected ? dark ? `0 8px 32px ${tableColor}25` : `0 8px 32px ${tableColor}18` : isRelated ? dark ? `0 4px 20px ${tableColor}15` : `0 4px 20px ${tableColor}10` : 'none',
                    '&:hover': { borderColor: dark ? `${tableColor}70` : `${tableColor}90`, boxShadow: dark ? `0 8px 32px ${tableColor}20` : `0 8px 32px ${tableColor}14` },
                  }}
                >
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, pb: 1 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: dark ? `${tableColor}18` : `${tableColor}10`, color: dark ? `${tableColor}cc` : tableColor, transition: 'all 0.3s ease', '&:hover': { transform: 'rotate(-8deg) scale(1.1)' } }}>
                      <TableChartIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: dark ? '#f1f5f9' : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{table.name}</Typography>
                      <Typography variant="caption" sx={{ color: dark ? 'rgba(203,213,225,0.5)' : '#94a3b8', fontSize: '0.7rem' }}>
                        {table.columns.length} columns{tableRelations.length > 0 && ` \u00b7 ${tableRelations.length} FK`}
                      </Typography>
                    </Box>
                    <Box onClick={(e) => { e.stopPropagation(); toggleExpand(table.name); }}
                      sx={{ width: 28, height: 28, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', background: isExpanded ? dark ? `${tableColor}15` : `${tableColor}10` : 'transparent', '&:hover': { background: dark ? `${tableColor}20` : `${tableColor}15`, transform: isExpanded ? 'rotate(180deg) scale(1.15)' : 'rotate(0deg) scale(1.15)' } }}>
                      <ExpandMoreIcon sx={{ fontSize: 20, color: dark ? 'rgba(203,213,225,0.6)' : '#64748b' }} />
                    </Box>
                  </Box>

                  {/* Column chips */}
                  <Box sx={{ px: 2, pb: 1 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {table.columns.slice(0, isExpanded ? undefined : 3).map((col) => (
                        <Chip key={col.name} size="small" label={col.name} icon={col.isPk ? <KeyIcon sx={{ fontSize: '12px !important' }} /> : undefined}
                          sx={{ height: 22, fontSize: '0.65rem', fontWeight: col.isPk ? 700 : 500, background: typeBg(col.type, dark), color: typeColor(col.type, dark), border: `1px solid ${typeColor(col.type, dark)}20`, borderRadius: '6px', '& .MuiChip-label': { px: 0.8 }, '& .MuiChip-icon': { ml: 0.3, color: 'inherit' }, transition: 'all 0.2s ease', '&:hover': { boxShadow: `0 0 8px ${typeColor(col.type, dark)}20`, transform: 'scale(1.05)' } }} />
                      ))}
                      {!isExpanded && table.columns.length > 3 && (
                        <Chip size="small" label={`+${table.columns.length - 3}`} sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: dark ? '#94a3b8' : '#64748b', borderRadius: '6px' }} />
                      )}
                    </Box>
                  </Box>

                  {/* Expanded content */}
                  <Collapse in={isExpanded} timeout={350}>
                    <Box sx={{ px: 2, pb: 2, pt: 0.5 }}>
                      {showRelations && tableRelations.length > 0 && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: dark ? 'rgba(203,213,225,0.5)' : '#94a3b8', mb: 0.8, display: 'block' }}>Foreign Keys</Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {tableRelations.map((r) => {
                              const isOutgoing = r.from === table.name;
                              const otherTable = isOutgoing ? r.to : r.from;
                              const otherColor = getTableColor(otherTable);
                              const rInfo = relationTypeInfo(r.type, dark);
                              return (
                                <Box key={`${r.from}-${r.to}-${r.fromCol}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', py: 0.5, px: 1, borderRadius: 1.5, background: dark ? 'rgba(99,102,241,0.06)' : 'rgba(79,70,229,0.03)', border: '1px solid', borderColor: dark ? 'rgba(99,102,241,0.1)' : 'rgba(79,70,229,0.06)', '&:hover': { background: dark ? 'rgba(99,102,241,0.1)' : 'rgba(79,70,229,0.06)' } }}>
                                  <Chip label={rInfo.short} size="small" sx={{ height: 18, fontSize: '0.58rem', fontWeight: 700, background: rInfo.bg, color: rInfo.color, border: `1px solid ${rInfo.border}`, borderRadius: '4px', '& .MuiChip-label': { px: 0.6 } }} />
                                  <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 500, color: dark ? 'rgba(203,213,225,0.7)' : '#64748b', fontFamily: 'monospace' }}>{r.fromCol}</Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', color: dark ? '#818cf8' : '#4f46e5' }}>{isOutgoing ? <ArrowForwardIcon sx={{ fontSize: 14 }} /> : <ArrowBackIcon sx={{ fontSize: 14 }} />}</Box>
                                  <Chip label={otherTable} size="small" onClick={(e) => { e.stopPropagation(); setSelectedTable(otherTable); setExpandedTables((prev) => new Set(prev).add(otherTable)); }}
                                    sx={{ height: 20, fontSize: '0.6rem', fontWeight: 600, background: dark ? `${otherColor}15` : `${otherColor}10`, color: dark ? `${otherColor}cc` : otherColor, border: `1px solid ${dark ? `${otherColor}25` : `${otherColor}18`}`, cursor: 'pointer', '&:hover': { background: dark ? `${otherColor}25` : `${otherColor}18`, transform: 'scale(1.05)' }, '& .MuiChip-label': { px: 0.8 } }} />
                                  <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 500, color: dark ? 'rgba(203,213,225,0.5)' : '#94a3b8', fontFamily: 'monospace' }}>.{r.toCol}</Typography>
                                  <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 600, ml: 'auto', color: rInfo.color }}>{rInfo.label}</Typography>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      )}
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: dark ? 'rgba(203,213,225,0.5)' : '#94a3b8', mb: 0.5, display: 'block' }}>Columns</Typography>
                      <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: dark ? 'rgba(99,102,241,0.1)' : 'rgba(79,70,229,0.06)', overflow: 'hidden' }}>
                        {table.columns.map((col, idx) => (
                          <Box key={col.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.6, px: 1.2, borderBottom: idx < table.columns.length - 1 ? '1px solid' : 'none', borderColor: dark ? 'rgba(99,102,241,0.06)' : 'rgba(79,70,229,0.04)', background: col.isPk ? dark ? `${tableColor}08` : `${tableColor}05` : 'transparent', '&:hover': { background: dark ? 'rgba(99,102,241,0.06)' : 'rgba(79,70,229,0.03)' } }}>
                            {col.isPk && <KeyIcon sx={{ fontSize: 13, color: dark ? '#fbbf24' : '#d97706' }} />}
                            <Typography variant="caption" sx={{ fontWeight: col.isPk ? 700 : 500, fontSize: '0.72rem', color: dark ? '#e2e8f0' : '#334155', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{col.name}</Typography>
                            <Chip label={col.type} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, background: typeBg(col.type, dark), color: typeColor(col.type, dark), borderRadius: '4px', '& .MuiChip-label': { px: 0.6 } }} />
                            {col.nullable && <Typography variant="caption" sx={{ fontSize: '0.6rem', color: dark ? 'rgba(203,213,225,0.4)' : '#94a3b8', fontStyle: 'italic' }}>null</Typography>}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Collapse>
                </Paper>
              </motion.div>
            );
          })}
        </Box>
      </Box>

      {filteredTables.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">No tables found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Try a different search term</Typography>
        </Box>
      )}
    </Box>
  );
}
