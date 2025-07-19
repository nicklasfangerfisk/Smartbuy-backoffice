import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Sheet,
  Typography,
  Avatar,
  Divider,
  Input,
  Tooltip,
  GlobalStyles,
} from '@mui/joy';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';
import { supabase } from '../utils/supabaseClient';
import ColorSchemeToggle from './ColorSchemeToggle';
import { menuByArea, MenuArea, MenuItem, MenuValue } from './menuConfig';

interface ResponsiveMenuProps {
  onViewChange?: (view: MenuValue) => void;
  currentView?: string;
}

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role?: string;
}

/**
 * Unified responsive menu component that handles both desktop sidebar and mobile navigation
 * Uses MUI Joy consistently and provides a single source of truth for navigation
 */
export default function ResponsiveMenu({ onViewChange, currentView }: ResponsiveMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // State management
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [expandedAreas, setExpandedAreas] = useState<Record<MenuArea, boolean>>({
    Sales: true,
    Support: true,
    Marketing: true,
    Operations: true,
    Administration: true,
  });

  // Auto-collapse logic based on breakpoints
  useEffect(() => {
    if (isTablet) {
      setIsCollapsed(true);
    }
  }, [isTablet, isDesktop]);

  // Authentication and user profile management
  useEffect(() => {
    const handleAuthUser = async (authUser: any) => {
      setUser(authUser);
      if (authUser) {
        let { data: userRow } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (!userRow) {
          await supabase.from('users').upsert({
            id: authUser.id,
            email: authUser.email,
            first_name: authUser.user_metadata?.full_name?.split(' ')[0] || null,
            last_name: authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || null,
            avatar_url: authUser.user_metadata?.avatar_url || null,
            role: 'employee',
          });
          userRow = { ...authUser, role: 'employee' };
        }
        setUserProfile(userRow);
      } else {
        setUserProfile(null);
      }
    };

    supabase.auth.getUser().then(({ data }) => handleAuthUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthUser(session?.user ?? null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  // Hide menu on login page
  if (location.pathname === '/login') {
    return null;
  }

  // Navigation handlers
  const handleNavigation = (item: MenuItem) => {
    navigate(item.route);
    onViewChange?.(item.value);
    
    // Auto-close mobile drawer and collapse on tablet after navigation
    if (isMobile) {
      setMobileOpen(false);
    } else if (isTablet) {
      setIsCollapsed(true);
    }
  };

  const handleProfileClick = () => {
    navigate('/settings');
    onViewChange?.('settings');
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const toggleArea = (area: MenuArea) => {
    setExpandedAreas(prev => ({
      ...prev,
      [area]: !prev[area]
    }));
  };

  const isSelected = (route: string) => location.pathname === route;

  // Menu content component
  const MenuContent = ({ mobile = false }: { mobile?: boolean }) => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      width: mobile ? 280 : '100%',
      maxWidth: mobile ? 280 : '100%',
      boxSizing: 'border-box', // Ensure padding is included in width
      ...(mobile && {
        px: 0, // Remove horizontal padding for mobile
      }),
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        gap: (!isCollapsed || mobile) ? 1 : 0, // Remove gap in collapsed mode
        alignItems: 'center', 
        p: (!isCollapsed || mobile) ? (mobile ? 1 : 1.5) : 1, // Reduced padding for mobile
        flexShrink: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
        width: '100%',
        minWidth: 0, // Allow container to shrink
        justifyContent: (!isCollapsed || mobile) ? 'flex-start' : 'center',
        boxSizing: 'border-box', // Include padding in width calculation
      }}>
        {mobile && (
          <IconButton size="sm" onClick={() => setMobileOpen(false)}>
            <CloseIcon />
          </IconButton>
        )}
        
        {/* Logo/Toggle button - always visible */}
        <IconButton 
          size="sm" 
          variant="plain"
          onClick={mobile ? undefined : toggleSidebar}
          sx={{ 
            cursor: mobile ? 'default' : 'pointer',
            flexShrink: 0,
            ...(isCollapsed && !mobile && {
              p: 0.5, // Reduced padding for better centering in collapsed mode
              minWidth: 'auto',
              minHeight: 'auto',
            }),
          }}
        >
          <img src="/favicon.svg" alt="Logo" style={{ width: 28, height: 28, borderRadius: 6 }} />
        </IconButton>
        
        {/* Expandable content - only show when not collapsed or on mobile */}
        {(!isCollapsed || mobile) && (
          <>
            <Typography 
              level="title-lg" 
              sx={{ 
                flexShrink: 1, 
                minWidth: 0, // Allow text to shrink
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              Smartbuy
            </Typography>
            <ColorSchemeToggle 
              sx={{ 
                ml: 'auto', 
                flexShrink: 0,
                minWidth: 'fit-content' // Ensure button doesn't get squeezed
              }} 
            />
          </>
        )}
      </Box>

      {/* Search - only show when not collapsed */}
      {(!isCollapsed || mobile) && (
        <Box sx={{ p: mobile ? 1 : 1.5, flexShrink: 0, boxSizing: 'border-box' }}>
          <Input 
            size="sm" 
            startDecorator={<SearchIcon />} 
            placeholder="Search" 
            sx={{ width: '100%' }}
          />
        </Box>
      )}

      {/* Navigation Areas */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden',
        p: isCollapsed && !mobile ? 0 : mobile ? 0 : 1, // No padding for mobile, normal padding for desktop
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box', // Include padding in width
      }}>
        {isCollapsed && !mobile ? (
          // Collapsed view - show only icons with dividers
          <List size="sm" sx={{ '--ListItem-radius': '8px', gap: 0, width: '100%', p: 0 }}>
            {(['Sales', 'Support', 'Operations', 'Marketing', 'Administration'] as MenuArea[]).map((area, areaIndex) => (
              <React.Fragment key={area}>
                {areaIndex > 0 && <Divider sx={{ my: 0.5 }} />}
                {menuByArea[area].map((item: MenuItem) => (
                  <ListItem key={item.value} sx={{ width: '100%', p: 0 }}>
                    <Tooltip title={item.label} placement="right" arrow>
                      <ListItemButton
                        selected={isSelected(item.route)}
                        onClick={() => handleNavigation(item)}
                        sx={{ 
                          justifyContent: 'center', 
                          minHeight: 36,
                          width: '100%',
                          maxWidth: '100%',
                          borderRadius: 'var(--ListItem-radius)',
                          m: 0,
                          p: 1,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.softBg',
                            color: 'primary.softColor',
                          },
                          '& .MuiSvgIcon-root': {
                            fontSize: '1.1rem',
                          },
                        }}
                      >
                        {item.icon}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                ))}
              </React.Fragment>
            ))}
          </List>
        ) : (
          // Expanded view - show sections with titles
          <List size="sm" sx={{ 
            '--List-nestedInsetStart': mobile ? '12px' : '16px', // Reduced indentation for mobile
            '--ListItem-radius': '8px',
            width: '100%',
            boxSizing: 'border-box',
            p: 0, // Remove default padding
            m: 0, // Remove default margin
          }}>
            {(['Sales', 'Support', 'Operations', 'Marketing', 'Administration'] as MenuArea[]).map((area) => (
              <ListItem nested key={area} sx={{ 
                width: '100%', 
                boxSizing: 'border-box',
                p: 0, // Remove default padding
                m: 0, // Remove default margin
              }}>
                <Box sx={{ 
                  width: '100%', 
                  boxSizing: 'border-box',
                  p: 0, // Remove default padding
                  m: 0, // Remove default margin
                  mb: 1, // Keep bottom margin for separation
                }}>
                  <ListItemButton
                    onClick={() => toggleArea(area)}
                    sx={{
                      justifyContent: 'space-between',
                      fontWeight: 'bold',
                      bgcolor: 'transparent', // Remove highlight background
                      width: '100%',
                      boxSizing: 'border-box',
                      m: 0, // Remove default margin
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {menuByArea[area][0]?.icon}
                      <Typography level="title-sm">{area}</Typography>
                    </Box>
                    <KeyboardArrowDownIcon
                      sx={{
                        transform: expandedAreas[area] ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </ListItemButton>
                  
                  {/* Area Menu Items */}
                  {expandedAreas[area] && (
                    <List sx={{ 
                      gap: 0.5, 
                      mt: 0.5, 
                      width: '100%', 
                      boxSizing: 'border-box',
                      p: 0, // Remove default padding
                      m: 0, // Remove default margin
                    }}>
                      {menuByArea[area].map((item: MenuItem) => (
                        <ListItem key={item.value} sx={{ 
                          width: '100%', 
                          boxSizing: 'border-box',
                          p: 0, // Remove default padding
                          m: 0, // Remove default margin
                        }}>
                          <ListItemButton
                            selected={isSelected(item.route)}
                            onClick={() => handleNavigation(item)}
                            sx={{
                              borderRadius: 'var(--ListItem-radius)',
                              width: '100%',
                              boxSizing: 'border-box',
                              m: 0, // Remove default margin
                              '&.Mui-selected': {
                                backgroundColor: 'primary.softBg',
                                color: 'primary.softColor',
                              },
                            }}
                          >
                            <ListItemDecorator>{item.icon}</ListItemDecorator>
                            <ListItemContent>{item.label}</ListItemContent>
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* User Profile */}
      <Box sx={{ flexShrink: 0, borderTop: '1px solid', borderColor: 'divider' }}>
        <ListItemButton
          onClick={handleProfileClick}
          sx={{
            p: 2,
            gap: 1.5,
            '&:hover': { bgcolor: 'background.level1' },
          }}
        >
          <Avatar
            size="sm"
            src={userProfile?.avatar_url || user?.user_metadata?.avatar_url}
          >
            {(!userProfile?.avatar_url && !user?.user_metadata?.avatar_url) && (
              userProfile?.first_name?.[0] || userProfile?.email?.[0] || '?'
            )}
          </Avatar>
          {(!isCollapsed || mobile) && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography level="title-sm" sx={{ fontWeight: 'bold' }}>
                {userProfile?.first_name && userProfile?.last_name
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  : userProfile?.email || 'User'}
              </Typography>
              <Typography level="body-xs" color="neutral">
                {userProfile?.role || 'Employee'}
              </Typography>
            </Box>
          )}
        </ListItemButton>
      </Box>
    </Box>
  );

  // Mobile implementation
  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Toggle Button - Fixed position */}
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            bgcolor: 'background.surface',
            boxShadow: 'md',
            '&:hover': { bgcolor: 'background.level1' },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Mobile Drawer */}
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          slotProps={{
            backdrop: {
              sx: { bgcolor: 'background.backdrop' }
            }
          }}
        >
          <Sheet sx={{ height: '100%' }}>
            <MenuContent mobile />
          </Sheet>
        </Drawer>
      </>
    );
  }

  // Desktop/Tablet implementation
  return (
    <>
      <GlobalStyles
        styles={{
          ':root': {
            '--Sidebar-width': isCollapsed ? '60px' : '240px',
          },
        }}
      />
      <Sheet
        sx={{
          display: 'flex',
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: 'var(--Sidebar-width)',
          minWidth: 'var(--Sidebar-width)',
          maxWidth: 'var(--Sidebar-width)',
          transition: 'width 0.3s ease',
          borderRight: '1px solid',
          borderColor: 'divider',
          zIndex: 100,
          overflowX: 'hidden', // Only prevent horizontal overflow
          overflowY: 'auto', // Allow vertical scrolling if needed
          boxSizing: 'border-box', // Include borders in width
        }}
      >
        <MenuContent />
      </Sheet>
    </>
  );
}
