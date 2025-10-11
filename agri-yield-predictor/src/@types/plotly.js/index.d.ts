import * as Plotly from 'plotly.js';

declare module 'plotly.js' {
  interface Data {
    // Add any custom properties you need
    [key: string]: any;
  }

  interface Layout {
    title?: string | Partial<Annotations>;
    xaxis?: Partial<LayoutAxis> & { title?: string | Partial<Annotations> };
    yaxis?: Partial<LayoutAxis> & { title?: string | Partial<Annotations> };
    [key: string]: any;
  }
}

export * from 'plotly.js';
