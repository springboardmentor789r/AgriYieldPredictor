import 'plotly.js';

declare module 'plotly.js' {
  // Extend the Data interface to be more permissive
  interface Data {
    [key: string]: any;
  }

  // Make Layout more flexible
  interface Layout {
    [key: string]: any;
  }

  // Make PlotData more flexible
  interface PlotData {
    [key: string]: any;
  }

  // Make LayoutAxis more flexible
  interface LayoutAxis {
    [key: string]: any;
  }

  // Make Annotations more flexible
  interface Annotations {
    [key: string]: any;
  }
}
