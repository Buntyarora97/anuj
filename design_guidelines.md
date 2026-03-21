# 3 Batti Game - Design Guidelines

## Brand Identity
**Purpose**: A playful traffic light betting game offering quick entertainment with virtual coins.

**Aesthetic Direction**: Bold/striking with game-show energy - high contrast dark theme, neon-inspired traffic light accents, punchy animations, and satisfying visual feedback. The app should feel exciting and immediate, like a digital arcade game.

**Memorable Element**: Glowing, pulsing traffic lights that dominate the screen during countdown, creating anticipation and energy.

## Navigation Architecture
**Type**: Stack-Only (single-screen focused experience)

**Screens**:
- Main Game Screen (home) - Place bets and watch traffic lights
- History Modal - Past game results
- Leaderboard Modal - Top players by balance
- Settings/Profile Overlay - Coins balance, reset game, info

## Screen-by-Screen Specifications

### Main Game Screen
**Purpose**: Core gameplay - betting and watching rounds
**Layout**:
- Header: Transparent, displays coin balance (top-right), menu button (top-left)
- Content: NOT scrollable, fixed viewport
  - Top 1/3: Three large traffic light circles (horizontally arranged)
  - Middle: Countdown timer (large, centered)
  - Bottom 1/3: Betting controls (amount selector, three color bet buttons)
  - Floating: Results banner slides in from top after each round
- Safe Area: Top inset = headerHeight + Spacing.lg, Bottom = insets.bottom + Spacing.lg

**Components**:
- Traffic lights: Large circular indicators with glow effect when active
- Timer: Bold numerical countdown
- Coin input: Number stepper (-, amount, +)
- Bet buttons: Three large pill-shaped buttons (Red, Yellow, Green) with color-coded backgrounds
- Results banner: Slide-in notification showing win/loss with coin animation

### History Modal
**Purpose**: View past 10 game results
**Layout**:
- Header: Standard with "History" title, close button (top-right)
- Content: Scrollable list
- Safe Area: Bottom = insets.bottom + Spacing.xl

**Components**:
- List items: Round number, bet color, result color, coins won/lost, timestamp
- Empty state: "No games played yet" with traffic-light-history.png illustration

### Leaderboard Modal
**Purpose**: Show top players by coin balance
**Layout**:
- Header: Standard with "Leaderboard" title, close button (top-right)
- Content: Scrollable ranked list
- Safe Area: Bottom = insets.bottom + Spacing.xl

**Components**:
- List items: Rank badge, player name, coin balance
- Top 3 highlighted with gold/silver/bronze accents
- Empty state: "No players yet" with trophy.png illustration

### Settings Overlay
**Purpose**: View total balance, reset game, about info
**Layout**: Centered card overlay with dimmed background
**Components**: 
- Current balance display
- Reset game button (with confirmation)
- About/rules text
- Close button

## Color Palette
```
Primary (Traffic Lights):
- Red: #FF3B30
- Yellow: #FFCC00
- Green: #34C759

Background:
- Dark Base: #0A0E27
- Surface: #1A1F3A
- Surface Light: #252B4A

Text:
- Primary: #FFFFFF
- Secondary: #A0A6C8
- Muted: #6B7199

Semantic:
- Success: #34C759
- Error: #FF3B30
- Warning: #FFCC00
- Coin Gold: #FFD700

Accents:
- Neon Glow: rgba(255, 255, 255, 0.3) for light halos
```

## Typography
**Font**: System default (web-safe) with bold weights for impact

**Type Scale**:
- Mega (Timer): 72px, Bold
- Title: 24px, Bold
- Body: 16px, Regular
- Caption: 14px, Regular
- Small: 12px, Regular

## Visual Design
- Traffic lights have subtle glow effect when active/winning
- Bet buttons pulse gently when enabled
- All buttons have scale-down effect on press (transform: scale(0.95))
- Results banner slides in with bounce animation
- Use Feather icons for menu, close, history, leaderboard

## Assets to Generate

**Required**:
1. **app-icon.png** - Stylized three traffic lights icon (red, yellow, green circles stacked) - Used: Browser tab, home screen
2. **splash-icon.png** - Same as app icon with dark background - Used: Loading screen
3. **traffic-light-history.png** - Simple illustration of traffic lights with dotted timeline - Used: Empty state in History modal
4. **trophy.png** - Minimalist trophy icon with coin accents - Used: Empty state in Leaderboard modal
5. **coin-stack.png** - Stacked golden coins illustration - Used: Balance display, win animations
6. **celebration-burst.png** - Confetti/sparkle effect - Used: Win result overlay

**Style**: Neon-tinted, game-inspired illustrations on dark backgrounds. Clean vector style, not overly detailed.