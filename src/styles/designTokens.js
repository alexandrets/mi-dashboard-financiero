// src/styles/designTokens.js
const designTokens = {
  // Colores semánticos
  colors: {
    // Escala de grises
    white: 'text-white',
    black: 'text-black',
    gray: {
      50: 'bg-gray-50',
      100: 'bg-gray-100',
      200: 'bg-gray-200',
      300: 'bg-gray-300',
      400: 'text-gray-400',
      500: 'text-gray-500',
      600: 'text-gray-600',
      700: 'text-gray-700',
      800: 'text-gray-800',
      900: 'text-gray-900'
    },

    // Colores de estado
    primary: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-200'
    },
    secondary: {
      50: 'bg-gray-50',
      100: 'bg-gray-100',
      600: 'text-gray-600',
      700: 'text-gray-700',
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200'
    },
    success: {
      50: 'green-50',
      100: 'green-100',
      500: 'bg-green-500',
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    warning: {
      500: 'bg-yellow-500',
      600: 'yellow-600',
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200'
    },
    danger: {
      50: 'red-50',
      100: 'red-100',
      500: 'bg-red-500',
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200'
    }
  },

  // Tipografía
  typography: {
    // Títulos grandes para métricas
    metric: {
      sm: 'text-xl font-bold',
      lg: 'text-3xl font-bold',
      xl: 'text-4xl font-bold'
    },
    // Títulos de sección
    title: {
      sm: 'text-sm font-bold',
      md: 'text-base font-bold',
      lg: 'text-lg font-bold',
      xl: 'text-2xl font-bold',
      '2xl': 'text-3xl font-bold'
    },
    // Subtítulos
    subtitle: {
      sm: 'text-sm font-semibold',
      md: 'text-base font-semibold',
      lg: 'text-lg font-semibold'
    },
    // Texto normal
    body: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    },
    // Texto pequeño
    caption: {
      sm: 'text-xs'
    },
    // Texto descriptivo
    description: 'text-sm'
  },

  // Espaciado
  spacing: {
    // Márgenes de elementos
    elementMarginSmall: 'mb-4',
    elementMargin: 'mb-6',
    
    // Gaps entre secciones
    sectionGapSmall: 'space-x-3',
    sectionGap: 'gap-6',
    sectionMargin: 'mb-8',
    
    // Padding de cards
    cardPadding: 'p-6',
    cardPaddingLarge: 'p-8',
    
    // Padding de botones
    buttonPaddingSmall: 'px-4 py-2',
    
    // Padding de headers
    headerPadding: 'p-6'
  },

  // Layout
  layout: {
    container: 'max-w-7xl mx-auto',
    pageSpacing: 'p-6',
    sectionSpacing: 'mb-8',
    gridMain: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
    gridStats: 'grid grid-cols-1 md:grid-cols-3 gap-6',
    gridCards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
  },

  // Bordes y radios
  borders: {
    card: 'border border-gray-200',
    input: 'border border-gray-300',
    inputFocus: 'focus:border-blue-500',
    radius: {
      sm: 'rounded',
      md: 'rounded-lg',
      lg: 'rounded-xl',
      xl: 'rounded-2xl',
      full: 'rounded-full'
    }
  },

  // Sombras
  shadows: {
    card: 'shadow-lg',
    cardHover: 'hover:shadow-md',
    cardActive: 'shadow-xl',
    dropdown: 'shadow-lg',
    button: 'shadow-lg'
  },

  // Transiciones
  transitions: {
    all: 'transition-all',
    colors: 'transition-colors',
    normal: 'duration-200',
    buttonHover: 'transition-all duration-200 transform hover:scale-105'
  },

  // Componentes predefinidos
  components: {
    // Botones - Solo clases simples que Tailwind detecta
    button: {
      base: 'w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2',
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
      success: 'bg-green-600 hover:bg-green-700 text-white'
    },
    
    // Cards
    card: {
      base: 'bg-white rounded-2xl shadow-lg',
      padding: 'p-6'
    },
    
    // Tarjetas de estadísticas
    statCard: {
      base: 'bg-white rounded-xl shadow-md',
      padding: 'p-6'
    },
    
    // Items de transacción
    transactionItem: {
      base: 'bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow',
      padding: 'p-4'
    },
    
    // Headers de sección
    sectionHeader: {
      container: 'flex items-center space-x-3 mb-6',
      title: 'text-xl font-bold text-gray-800'
    },
    
    // Contenedores de iconos - Simplificados
    iconContainer: {
      primary: 'w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center',
      secondary: 'w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center',
      warning: 'w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center'
    }
  },

  // Clases especiales que se usan directamente (no en template literals)
  // ESTAS SE USAN DIRECTAMENTE EN EL JSX: className="..."
  directClasses: {
    // Fondos con gradientes - usar directamente
    backgroundGradient: 'bg-gradient-to-br from-blue-50 via-white to-purple-50',
    headerGradient: 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700',
    cardGradient: 'bg-gradient-to-r from-white to-blue-50',
    
    // Gradientes para iconos - usar directamente
    iconGradient: 'bg-gradient-to-r from-blue-500 to-purple-600',
    
    // Botones con gradientes - usar directamente
    buttonPrimaryGradient: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
    buttonSuccessGradient: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    buttonInfoGradient: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700',
    buttonAnalyticsGradient: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
  }
}

export default designTokens