# Image Gen Next.js

A modern, full-featured image generation and manipulation tool built with Next.js. This application provides comprehensive tools for creating, editing, and exporting visual content with advanced layout management, carousel support, and dynamic templating.

## Features

- 🎨 **Advanced Image Generation** - Create custom images with templating system
- 🎠 **Carousel Support** - Build multi-slide carousels with responsive layouts
- 🎭 **Multiple Templates** - Pre-built templates for various content types (Versus, Stack, Sandwich, Bullets, etc.)
- 🔧 **Layout Manager** - Drag-and-drop interface for designing layouts
- 🎯 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 📦 **Export Options** - Export as images or ZIP archives with multiple slides
- ⚙️ **Modular Architecture** - Component-based structure for easy customization
- 🔄 **Real-time Preview** - See changes as you make them
- 🎨 **Custom Styling** - Special styling options for advanced customization
- 📱 **Mobile Optimized** - Works seamlessly on all devices

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4 with PostCSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Drag & Drop**: dnd-kit
- **Image Generation**: Puppeteer
- **Type Safety**: TypeScript
- **Linting**: ESLint 9

## Project Structure

```
src/
  ├── app/                 # Next.js app directory
  ├── components/          # Reusable React components
  └── lib/                 # Utility functions and helpers

templates/
  ├── base.html           # Base template
  ├── carousel/           # Carousel templates
  ├── versus.html         # Versus layout
  ├── stack.html          # Stack layout
  ├── sandwich.html       # Sandwich layout
  └── ...                 # Other templates

public/
  ├── css/                # Global styles
  ├── fonts/              # Custom fonts
  ├── logos/              # Logo assets
  └── sample-carousel.json # Sample data

docs/
  └── FITFEED-LAYOUTS.md  # Layout documentation

examples/
  └── carousel-usage.ts   # Usage examples
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd image-gen-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Documentation

- [Layout Manager Design](./LAYOUT-MANAGER-DESIGN.md) - Architecture and design patterns
- [Multi-Slide Architecture](./MULTI-SLIDE-ARCHITECTURE.md) - Carousel and multi-slide support
- [FitFeed Layouts](./docs/FITFEED-LAYOUTS.md) - Available layout types
- [Modular Generation](./MODULAR-GENERATION.md) - API documentation
- [Special Styling Guide](./SPECIAL-STYLING.md) - Advanced styling options

## Key Components

### Carousel System
- Multi-slide support with responsive layouts
- Automatic sizing and positioning
- Shadow and card mode options
- Black image handling

### Layout System
- Modular layout components
- Horizontal and vertical groups
- Customizable spacing and alignment
- Text wrapping and alignment options

### Export System
- PNG/JPG export with Puppeteer
- ZIP archive generation for multi-slide content
- Customizable output dimensions
- Quality and format options

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Author

Created with ❤️ for content creators and developers.
