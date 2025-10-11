import { PlotlyHTMLElement } from 'plotly.js';

declare module 'react-plotly.js' {
  import * as Plotly from 'plotly.js';
  import { Component } from 'react';

  export interface PlotParams {
    data: Array<Partial<Plotly.Data>>;
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    frames?: Plotly.Frame[];
    style?: React.CSSProperties;
    className?: string;
    onInitialized?: (figure: Plotly.Figure, graphDiv: PlotlyHTMLElement) => void;
    onUpdate?: (figure: Plotly.Figure, graphDiv: PlotlyHTMLElement) => void;
    onPurge?: (figure: Plotly.Figure, graphDiv: PlotlyHTMLElement) => void;
    onError?: (err: Error) => void;
    onClick?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onClickAnnotation?: (event: Readonly<Plotly.ClickAnnotationEvent>) => void;
    onBeforeHover?: (event: Readonly<Plotly.PlotMouseEvent>) => boolean | void;
    onHover?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onUnHover?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onSelected?: (event: Readonly<Plotly.PlotSelectionEvent>) => void;
    onSelecting?: (event: Readonly<Plotly.PlotSelectionEvent>) => void;
    onDeselect?: () => void;
    onRelayout?: (event: Readonly<Plotly.PlotRelayoutEvent>) => void;
    onRestyle?: (event: Readonly<Plotly.PlotRestyleEvent>) => void;
    onRedraw?: () => void;
    onAnimated?: () => void;
    onAnimatingFrame?: (event: Readonly<Plotly.FrameAnimationEvent>) => void;
    onAnimationInterrupted?: () => void;
    onAutoSize?: () => void;
    onBeforeExport?: () => void;
    onAfterExport?: () => void;
    onDoubleClick?: () => void;
    onFramework?: () => void;
    onSunburstClick?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onSliderChange?: (event: Readonly<Plotly.SliderChangeEvent>) => void;
    onSliderEnd?: (event: Readonly<Plotly.SliderEndEvent>) => void;
    onSliderStart?: (event: Readonly<Plotly.SliderStartEvent>) => void;
    onTransitioning?: () => void;
    onTransitionInterrupted?: () => void;
    onWebGlContextLost?: () => void;
    onLegendClick?: (event: Readonly<Plotly.LegendClickEvent>) => boolean;
    onLegendDoubleClick?: (event: Readonly<Plotly.LegendClickEvent>) => boolean;
    onMapboxAccessTokenError?: (event: Readonly<ErrorEvent>) => void;
    onMapboxLayerClick?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onMapboxMapClick?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
  }

  export default class Plot extends Component<PlotParams> {}
}
