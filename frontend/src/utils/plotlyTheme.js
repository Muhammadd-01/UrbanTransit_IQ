export const shadcnPlotlyTheme = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: {
    family: "var(--font-sans)",
    color: 'var(--color-text-muted)',
    size: 12
  },
  xaxis: {
    showgrid: false,
    zeroline: false,
    showline: false,
    tickcolor: 'transparent',
    tickfont: {
      family: "var(--font-sans)",
      color: 'var(--color-text-muted)',
      size: 11
    }
  },
  yaxis: {
    showgrid: true,
    gridcolor: 'var(--color-border-subtle)',
    gridwidth: 1,
    griddash: 'dash',
    zeroline: false,
    showline: false,
    tickcolor: 'transparent',
    tickfont: {
      family: "var(--font-sans)",
      color: 'var(--color-text-muted)',
      size: 11
    }
  },
  legend: {
    font: {
      family: "var(--font-sans)",
      color: 'var(--color-text-primary)',
      size: 12
    },
    bgcolor: 'transparent',
    bordercolor: 'transparent',
    borderwidth: 0,
    orientation: 'h',
    y: 1.15
  },
  hoverlabel: {
    bgcolor: 'var(--color-panel-elevated)',
    bordercolor: 'var(--color-border)',
    font: {
      family: "var(--font-sans)",
      color: 'var(--color-text-primary)',
      size: 12
    }
  },
  colorway: [
    '#000000', // Primary black (Shadcn default style)
    '#007AFF', // iOS Blue
    '#34C759', // iOS Green
    '#5E5CE6', // iOS Indigo
    '#FF3B30', // iOS Red
    '#FF9500'  // iOS Orange
  ]
};

export const darkPlotlyTheme = shadcnPlotlyTheme; // Alias

export const getPlotlyLayout = (customLayout = {}) => {
  return {
    autosize: true,
    paper_bgcolor: shadcnPlotlyTheme.paper_bgcolor,
    plot_bgcolor: shadcnPlotlyTheme.plot_bgcolor,
    font: { ...shadcnPlotlyTheme.font, ...(customLayout.font || {}) },
    xaxis: { ...shadcnPlotlyTheme.xaxis, ...(customLayout.xaxis || {}) },
    yaxis: { ...shadcnPlotlyTheme.yaxis, ...(customLayout.yaxis || {}) },
    legend: { ...shadcnPlotlyTheme.legend, ...(customLayout.legend || {}) },
    hoverlabel: { ...shadcnPlotlyTheme.hoverlabel, ...(customLayout.hoverlabel || {}) },
    colorway: customLayout.colorway || shadcnPlotlyTheme.colorway,
    margin: customLayout.margin || { l: 40, r: 10, t: 30, b: 30 },
    ...customLayout
  };
};

export const defaultPlotlyConfig = {
  displayModeBar: false,
  responsive: true,
  displaylogo: false
};
