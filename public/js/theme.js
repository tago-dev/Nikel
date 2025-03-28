// Theme management
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';
const THEME_STORAGE_KEY = 'nikel-theme';

// Aplicar o tema imediatamente para evitar flash de tela branca
applyThemeImmediately();

// Initialize theme quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Garantir que os elementos sejam obtidos após o carregamento do DOM
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // Event listeners
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        console.log('Theme toggle button initialized');
    } else {
        console.error('Theme toggle button not found');
    }

    // Inicializar o tema
    initTheme();
});

// Aplicar tema imediatamente baseado na preferência salva
function applyThemeImmediately() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === DARK_THEME) {
        document.documentElement.setAttribute('data-theme', DARK_THEME);
    } else if (savedTheme === LIGHT_THEME) {
        document.documentElement.setAttribute('data-theme', LIGHT_THEME);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', DARK_THEME);
    }
}

function initTheme() {
    const themeIcon = document.getElementById('theme-icon');

    // Check if theme preference is saved in localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const currentTheme = document.documentElement.getAttribute('data-theme');

    if (savedTheme === DARK_THEME || currentTheme === DARK_THEME) {
        applyDarkTheme();
    } else {
        applyLightTheme();
    }
}

function toggleTheme() {
    console.log('Toggle theme called');
    const currentTheme = document.documentElement.getAttribute('data-theme');

    if (currentTheme === DARK_THEME) {
        applyLightTheme();
        console.log('Applied light theme');
    } else {
        applyDarkTheme();
        console.log('Applied dark theme');
    }
}

function applyDarkTheme() {
    document.documentElement.setAttribute('data-theme', DARK_THEME);
    document.body.classList.add('theme-dark');
    localStorage.setItem(THEME_STORAGE_KEY, DARK_THEME);

    // Atualizar o ícone do tema
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.classList.remove('bi-moon-fill');
        themeIcon.classList.add('bi-sun-fill');
    }

    // Handle Chart.js themes if charts are present
    updateChartsTheme(DARK_THEME);
}

function applyLightTheme() {
    document.documentElement.setAttribute('data-theme', LIGHT_THEME);
    document.body.classList.remove('theme-dark');
    localStorage.setItem(THEME_STORAGE_KEY, LIGHT_THEME);

    // Atualizar o ícone do tema
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.classList.remove('bi-sun-fill');
        themeIcon.classList.add('bi-moon-fill');
    }

    // Handle Chart.js themes if charts are present
    updateChartsTheme(LIGHT_THEME);
}

// Update charts theme if they exist (for analytics page)
function updateChartsTheme(theme) {
    // Check if Chart is defined (analytics page)
    if (typeof Chart !== 'undefined' && Chart.instances) {
        const textColor = theme === DARK_THEME ? '#e6e6e6' : '#212529';
        const gridColor = theme === DARK_THEME ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        // Update global defaults for new charts
        Chart.defaults.color = textColor;
        Chart.defaults.scale.grid.color = gridColor;

        // Update all existing charts
        Object.values(Chart.instances).forEach(chart => {
            // Update scales
            if (chart.config.options.scales) {
                Object.values(chart.config.options.scales).forEach(scale => {
                    scale.ticks = scale.ticks || {};
                    scale.ticks.color = textColor;
                    scale.grid = scale.grid || {};
                    scale.grid.color = gridColor;
                });
            }

            // Update legend
            if (chart.config.options.plugins && chart.config.options.plugins.legend) {
                chart.config.options.plugins.legend.labels = chart.config.options.plugins.legend.labels || {};
                chart.config.options.plugins.legend.labels.color = textColor;
            }

            chart.update();
        });
    }
} 