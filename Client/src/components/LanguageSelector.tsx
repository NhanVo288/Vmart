import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText, Typography, Box } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation, LANGUAGES, type SupportedLanguage } from '../lib/i18n';

export const LanguageSelector: React.FC = () => {
  const { currentLang, changeLanguage } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (code: SupportedLanguage) => {
    changeLanguage(code);
    handleClose();
  };

  const activeLangConfig = LANGUAGES.find((l) => l.code === currentLang) ?? LANGUAGES[0];

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={<LanguageIcon sx={{ color: 'text.primary', fontSize: 20 }} />}
        sx={{
          color: 'text.primary',
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
          px: 1.5,
          py: 0.75,
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <span>{activeLangConfig.flag}</span>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {activeLangConfig.nativeName}
          </Typography>
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 160,
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={lang.code === currentLang}
            onClick={() => handleSelect(lang.code)}
            sx={{
              borderRadius: 1,
              mx: 0.5,
              my: 0.25,
              '&.Mui-selected': {
                bgcolor: 'action.selected',
                fontWeight: 700,
              },
            }}
          >
            <ListItemIcon sx={{ fontSize: '1.2rem', minWidth: 32 }}>
              {lang.flag}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: lang.code === currentLang ? 700 : 500,
                    color: 'text.primary',
                  }}
                >
                  {lang.nativeName}
                </Typography>
              }
              secondary={
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {lang.name}
                </Typography>
              }
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
