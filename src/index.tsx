// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Widget } from '@phosphor/widgets';

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { DSVModel } from '@jupyterlab/csvviewer';

import * as React from 'react';

import * as ReactDOM from 'react-dom';

import * as Plotly from 'plotly.js';

import { ReadonlyJSONObject } from '@phosphor/coreutils';

import ChartEditor, { PlotlyEditorState } from './component';

import '../style/index.css';

/**
 * The CSS class to add to the Plotly Editor Widget.
 */
const CSS_CLASS = 'jp-RenderedPlotlyEditor';

/**
 * The CSS class for a Plotly Editor icon.
 */
const CSS_ICON_CLASS = 'jp-MaterialIcon jp-PlotlyIcon';

/**
 * The MIME type for Plotly Editor.
 */
export const MIME_TYPE = 'application/vnd.plotly-editor.v1+json';

export class RenderedPlotlyEditor extends Widget
  implements IRenderMime.IRenderer {
  /**
   * Create a new widget for rendering Plotly Editor.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    this.addClass(CSS_CLASS);
    this._mimeType = options.mimeType;
  }

  /**
   * Dispose of the resources used by the widget.
   */
  dispose(): void {
    ReactDOM.unmountComponentAtNode(this.node);
    super.dispose();
  }

  /**
   * Render Plotly Editor into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const data = model.data[this._mimeType] as string;
      const metadata = model.metadata[this._mimeType] as
        | ReadonlyJSONObject
        | PlotlyEditorState;
      try {
        const delimiter = data.substr(0, 250).match(/.+(\t|,)/)[1];
        const dsvModel = new DSVModel({ data, delimiter });
        const handleUpdate = (
          state: PlotlyEditorState | ReadonlyJSONObject
        ) => {
          const metadata = { [this._mimeType]: state as ReadonlyJSONObject };
          model.setData({ metadata });
        };
        this._ref = ReactDOM.render(
          <ChartEditor
            model={dsvModel}
            state={metadata as PlotlyEditorState}
            handleUpdate={handleUpdate}
            plotly={Plotly}
          />,
          this.node,
          () => {
            resolve(undefined);
          }
        ) as ChartEditor;
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * A message handler invoked on a `'resize'` message.
   */
  protected onResize(msg: Widget.ResizeMessage): void {
    this.update();
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(): void {
    if (this.isVisible && this._ref) {
      this._ref.handleResize();
    }
  }

  private _mimeType: string;
  private _ref: ChartEditor;
}

/**
 * A mime renderer factory for Plotly Editor.
 */
export const rendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: [MIME_TYPE, 'text/csv', 'text/tsv'],
  createRenderer: options => new RenderedPlotlyEditor(options)
};

const extensions: IRenderMime.IExtension | IRenderMime.IExtension[] = [
  {
    id: 'jupyterlab-chart-editor:factory',
    rendererFactory,
    rank: 0,
    dataType: 'string',
    fileTypes: [
      // {
      //   name: 'plotlyEditor',
      //   mimeTypes: [MIME_TYPE],
      //   extensions: ['.plotly', 'plotly.json'],
      //   iconClass: CSS_ICON_CLASS
      // },
      {
        name: 'csv',
        mimeTypes: ['text/csv'],
        extensions: ['.csv'],
        iconClass: CSS_ICON_CLASS
      },
      {
        name: 'tsv',
        mimeTypes: ['text/tsv'],
        extensions: ['.tsv'],
        iconClass: CSS_ICON_CLASS
      }
    ],
    documentWidgetFactoryOptions: {
      name: 'Plotly Editor',
      primaryFileType: 'csv',
      fileTypes: ['csv', 'tsv']
    }
  }
];

export default extensions;
