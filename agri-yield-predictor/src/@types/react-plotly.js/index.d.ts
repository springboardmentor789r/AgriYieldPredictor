import * as Plotly from 'plotly.js';
import { Component } from 'react';

declare module 'react-plotly.js' {
  interface PlotParams {
    data: Array<Partial<Plotly.PlotData> | any>;
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
    [key: string]: any;
  }

  export default class Plot extends Component<PlotParams> {}
}
