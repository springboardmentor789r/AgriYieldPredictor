// Fix for Plotly types
declare module 'react-plotly.js' {
  import * as Plotly from 'plotly.js';
  import { Component } from 'react';

  interface PlotParams {
    data: Partial<Plotly.PlotData>[];
    layout?: Partial<Plotly.Layout> & {
      title?: string | Partial<Plotly.Annotations>;
      xaxis?: Partial<Plotly.LayoutAxis> & { title?: string | Partial<Plotly.Annotations> };
      yaxis?: Partial<Plotly.LayoutAxis> & { title?: string | Partial<Plotly.Annotations> };
    };
    config?: Partial<Plotly.Config>;
    style?: React.CSSProperties;
    className?: string;
    onInitialized?: (figure: any, graphDiv: any) => void;
    onUpdate?: (figure: any, graphDiv: any) => void;
    onPurge?: (figure: any, graphDiv: any) => void;
    onError?: (err: Error) => void;
  }

  export default class Plot extends Component<PlotParams> {}
}
