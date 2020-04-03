// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Widget } from '@lumino/widgets';

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import * as React from 'react';

import * as ReactDOM from 'react-dom';

import * as Plotly from 'plotly.js/dist/plotly.min';

import { ReadonlyJSONObject } from '@lumino/coreutils';

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
      const state = model.data[this._mimeType] as any | PlotlyEditorState;
      try {
        const handleUpdate = (
          state: PlotlyEditorState | ReadonlyJSONObject
        ) => {
          const newData = {
            [this._mimeType]: state as any | PlotlyEditorState
          };
          model.setData({ data: newData });
        };
        this._ref = (ReactDOM.render(
          <ChartEditor
            state={state}
            handleUpdate={handleUpdate}
            plotly={Plotly}
          />,
          this.node,
          () => {
            resolve(undefined);
          }
        ) as unknown) as ChartEditor;
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
  mimeTypes: [MIME_TYPE],
  createRenderer: options => new RenderedPlotlyEditor(options)
};

const extensions: IRenderMime.IExtension | IRenderMime.IExtension[] | any = [
  {
    id: 'jupyterlab-chart-editor:factory',
    name: 'jupyterlab-chart-editor:factory',
    rendererFactory,
    rank: 0,
    dataType: 'json',
    fileTypes: [
      {
        name: 'plotlyeditor',
        mimeTypes: [MIME_TYPE],
        extensions: ['.plotly', '.plotly.json'],
        iconClass: CSS_ICON_CLASS
      }
    ],
    documentWidgetFactoryOptions: {
      name: 'Plotly Editor',
      primaryFileType: 'plotlyeditor',
      // The 'plotly' type is defined in @jupyterlab/plotly-extension
      fileTypes: ['plotly', 'plotlyeditor', 'json'],
      defaultFor: ['plotlyeditor']
    }
  }
];

export default extensions;
