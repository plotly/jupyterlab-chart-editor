import { ActivityMonitor, PathExt } from '@jupyterlab/coreutils';

import {
  ILayoutRestorer,
  JupyterLabPlugin,
  JupyterLab
} from '@jupyterlab/application';

import {
  // ICommandPalette,
  InstanceTracker
} from '@jupyterlab/apputils';

import {
  ABCWidgetFactory,
  DocumentRegistry,
  Context
} from '@jupyterlab/docregistry';

import { Widget } from '@phosphor/widgets';

import { Message } from '@phosphor/messaging';

import { IDocumentManager } from '@jupyterlab/docmanager';

import {
  INotebookTracker,
  NotebookPanel,
  NotebookTracker
} from '@jupyterlab/notebook';

import { CodeCell } from '@jupyterlab/cells';

import { ReadonlyJSONObject, PromiseDelegate } from '@phosphor/coreutils';

import { DSVModel } from '@jupyterlab/csvviewer';

import * as React from 'react';

import * as ReactDOM from 'react-dom';

import * as Plotly from 'plotly.js';

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
 * The name of the factory that creates Plotly Editor widgets.
 */
const FACTORY = 'Plotly Editor';

/**
 * The timeout to wait for change activity to have ceased before rendering.
 */
const RENDER_TIMEOUT = 1000;

export namespace CommandIDs {
  export const JL_PLOTLY_EDITOR_OPEN = 'plotly_editor:open';
  export const JL_PLOTLY_EDITOR_SAVE = 'plotly_editor:save';
}

export class PlotlyEditorPanel extends Widget
  implements DocumentRegistry.IReadyWidget {
  constructor(options: PlotlyEditorPanel.IOptions) {
    super();
    this.addClass(CSS_CLASS);
    this._context = options.context;
    this.title.label = PathExt.basename(this._context.path);
    this._context.pathChanged.connect(this._onPathChanged, this);
    this._onPathChanged();
    this._context.ready.then(() => {
      this._ready.resolve(undefined);
      this._render();
      this._monitor = new ActivityMonitor({
        signal: this._context.model.contentChanged,
        timeout: RENDER_TIMEOUT
      });
      this._monitor.activityStopped.connect(this._render, this);
    });
  }

  /**
   * Get the context for the editor widget.
   */
  get context(): DocumentRegistry.Context {
    return this._context;
  }

  /**
   * A promise that resolves when the file editor is ready.
   */
  get ready(): Promise<void> {
    return this._ready.promise;
  }

  private _onPathChanged(): void {
    this.title.label = PathExt.basename(this._context.localPath);
  }

  /**
   * Dispose of the resources used by the widget.
   */
  dispose(): void {
    if (this._monitor) {
      this._monitor.dispose();
    }
    ReactDOM.unmountComponentAtNode(this.node);
    super.dispose();
  }

  /**
   * Handle `'activate-request'` messages.
   */
  protected onActivateRequest(msg: Message): void {
    this.node.tabIndex = -1;
    this.node.focus();
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

  /**
   * Render model to DOM.
   */
  private _render(): void {
    const content = this._context.model.toString();
    let model: DSVModel;
    let delimiter: string = ',';
    const handleUpdate = (state: PlotlyEditorState) => {
      // this._context.model.fromJSON(state);
      // this._context.save();
    };
    switch (true) {
      case this._context.path.endsWith('.plotly.json'):
        try {
          const state = JSON.parse(content);
          this._ref = ReactDOM.render(
            <ChartEditor
              state={state}
              handleUpdate={handleUpdate}
              plotly={Plotly}
            />,
            this.node
          ) as ChartEditor;
          break;
        } catch (error) {
          this.node.innerHTML = error.message;
          this.addClass('jp-RenderedText');
          this.removeClass(CSS_CLASS);
          this.node.setAttribute(
            'data-mime-type',
            'application/vnd.jupyter.stderr'
          );
          break;
        }
      case this._context.path.endsWith('.csv') ||
        this._context.path.endsWith('.tsv'):
        if (this._context.path.endsWith('.tsv')) delimiter = '\t';
        model = new DSVModel({ data: content, delimiter });
        this._ref = ReactDOM.render(
          <ChartEditor
            model={model}
            handleUpdate={handleUpdate}
            plotly={Plotly}
          />,
          this.node
        ) as ChartEditor;
    }
  }

  protected _context: DocumentRegistry.Context;
  private _ready = new PromiseDelegate<void>();
  private _monitor: ActivityMonitor<any, any> | null = null;
  _ref: ChartEditor;
}

/**
 * A namespace for `PlotlyEditor` statics.
 */
export namespace PlotlyEditorPanel {
  /**
   * Instantiation options for Plotly Editor widgets.
   */
  export interface IOptions {
    /**
     * The document context for the Plotly Editor being rendered by the widget.
     */
    context: DocumentRegistry.Context;
  }
}

class PlotlyEditorWidgetFactory extends ABCWidgetFactory<
  PlotlyEditorPanel,
  DocumentRegistry.IModel
> {
  constructor(options: DocumentRegistry.IWidgetFactoryOptions) {
    super(options);
  }

  protected createNewWidget(
    context: DocumentRegistry.Context
  ): PlotlyEditorPanel {
    return new PlotlyEditorPanel({ context });
  }
}

const fileTypes = ['csv', 'tsv', 'txt', 'plotly', 'plotly.json'];

function activate(
  app: JupyterLab,
  restorer: ILayoutRestorer,
  notebookTracker: NotebookTracker,
  // palette: ICommandPalette,
  docManager: IDocumentManager
) {
  const { commands } = app;

  function getCurrent(args: ReadonlyJSONObject): NotebookPanel | null {
    const widget = notebookTracker.currentWidget;
    const activate = args['activate'] !== false;
    if (activate && widget) {
      app.shell.activateById(widget.id);
    }
    return widget;
  }

  function createNew(cwd: string, data: any, open: boolean) {
    return commands
      .execute('docmanager:new-untitled', {
        path: cwd,
        ext: '.plotly.json',
        type: 'file'
      })
      .then(model => {
        return commands
          .execute('docmanager:open', {
            path: model.path,
            factory: FACTORY
          })
          .then(widget => {
            const context = docManager.contextForWidget(widget) as Context<
              DocumentRegistry.IModel
            >;
            context.model.fromJSON(data);
            context.save().then(() => {
              if (open) {
                commands.execute('docmanager:open', {
                  path: model.path,
                  factory: FACTORY
                });
              }
            });
          });
      });
  }

  commands.addCommand(CommandIDs.JL_PLOTLY_EDITOR_OPEN, {
    label: 'Open in Plotly Editor',
    caption: 'Open the datasource in Plotly Editor',
    execute: args => {
      const cur = getCurrent(args);
      if (cur) {
        const cell = cur.notebook.activeCell;
        if (cell.model.type === 'code') {
          let codeCell = cur.notebook.activeCell as CodeCell;
          let outputs = codeCell.model.outputs;
          let i = 0;
          while (i < outputs.length) {
            if (outputs.get(i).data['application/vnd.dataresource+json']) {
              const { data } = outputs.get(i).data[
                'application/vnd.dataresource+json'
              ] as any;
              console.log(data);
              const ll = app.shell.widgets('left');
              let fb = ll.next();
              while ((fb as any).id != 'filebrowser') {
                fb = ll.next();
              }
              const path = (fb as any).model.path as string;
              createNew(path, data, true);
              break;
            }
            i++;
          }
        }
      }
    }
  });

  commands.addCommand(CommandIDs.JL_PLOTLY_EDITOR_SAVE, {
    label: 'Save Current Plotly Editor',
    caption: 'Save the chart datasource as plotly.json file',
    execute: args => {
      let widget = app.shell.currentWidget;
      if (widget) {
        const ref = (widget as PlotlyEditorPanel)._ref;
        const data = {
          data: ref.state.data,
          layout: ref.state.layout
        };
        const context = docManager.contextForWidget(widget) as Context<
          DocumentRegistry.IModel
        >;
        context.model.fromJSON(data);
        if (context.path.includes('.plotly.json')) {
          context.save();
        } else {
          context.saveAs();
        }
      }
    },
    isEnabled: () => {
      const widget = app.shell.currentWidget;
      if (widget && widget.hasClass(CSS_CLASS)) {
        return true;
      } else {
        return false;
      }
    }
  });

  app.contextMenu.addItem({
    command: CommandIDs.JL_PLOTLY_EDITOR_OPEN,
    selector: '.dataframe'
  });

  app.contextMenu.addItem({
    command: CommandIDs.JL_PLOTLY_EDITOR_SAVE,
    selector: `.p-Widget.${CSS_CLASS}`
  });

  app.docRegistry.addFileType({
    name: 'tsv',
    extensions: ['.tsv']
  });

  app.docRegistry.addFileType({
    name: 'txt',
    extensions: ['.txt']
  });

  app.docRegistry.addFileType({
    name: 'plotlyEditor',
    extensions: ['.plotly', '.plotly.json']
  });

  const tracker = new InstanceTracker<PlotlyEditorPanel>({
    namespace: FACTORY
  });

  const factory = new PlotlyEditorWidgetFactory({
    name: FACTORY,
    fileTypes: fileTypes,
    defaultFor: ['plotlyEditor'],
    readOnly: true
  });

  restorer.restore(tracker, {
    command: 'docmanager:open',
    args: widget => ({ path: widget.context.path, factory: FACTORY }),
    name: widget => widget.context.path
  });

  app.docRegistry.addWidgetFactory(factory);

  factory.widgetCreated.connect((sender, widget) => {
    tracker.add(widget);
    widget.context.pathChanged.connect(() => {
      tracker.save(widget);
    });
    widget.title.iconClass = CSS_ICON_CLASS;
    widget.title.iconLabel = '';
  });
}

const plugin: JupyterLabPlugin<void> = {
  id: 'jupyterlab-chart-editor:plugin',
  autoStart: true,
  requires: [
    ILayoutRestorer,
    INotebookTracker,
    // ICommandPalette,
    IDocumentManager
  ],
  activate: activate
};

export default plugin;
